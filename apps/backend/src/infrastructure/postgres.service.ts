import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type QueryResultRow } from 'pg';
import { inMemoryDataEnabled } from '../auth/security';

@Injectable()
export class PostgresService implements OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private readonly pool?: Pool;
  private warned = false;
  private readonly attempts: number;
  private readonly slowQueryMs: number;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    const fallbackEnabled = inMemoryDataEnabled();
    const connectionTimeoutMillis = toPositiveInt(
      config.get<string>('DB_CONNECTION_TIMEOUT_MS'),
      fallbackEnabled ? 5_000 : 8_000,
    );
    const queryTimeoutMillis = toPositiveInt(
      config.get<string>('DB_QUERY_TIMEOUT_MS'),
      fallbackEnabled ? 5_000 : 8_000,
    );
    const max = toPositiveInt(config.get<string>('DB_POOL_MAX'), 5);
    const idleTimeoutMillis = toPositiveInt(
      config.get<string>('DB_IDLE_TIMEOUT_MS'),
      10_000,
    );
    this.slowQueryMs = toPositiveInt(config.get<string>('SLOW_QUERY_MS'), 300);
    this.attempts = fallbackEnabled
      ? 1
      : toPositiveInt(config.get<string>('DB_QUERY_ATTEMPTS'), 3);

    if (!connectionString) {
      if (!inMemoryDataEnabled()) {
        throw new Error('DATABASE_URL yo‘q va in-memory fallback o‘chirilgan');
      }
      return;
    }

    this.pool = new Pool({
      connectionString,
      connectionTimeoutMillis,
      idleTimeoutMillis,
      query_timeout: queryTimeoutMillis,
      statement_timeout: queryTimeoutMillis,
      max,
    });

    this.pool.on('error', (error: Error) => this.warnUnavailable(error));
  }

  async tryQuery<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: readonly unknown[] = [],
  ): Promise<T[] | null> {
    if (!this.pool) {
      if (!inMemoryDataEnabled()) {
        throw new Error('Postgres ulanmagan va in-memory fallback o‘chirilgan');
      }
      return null;
    }

    let lastError: unknown;

    for (let attempt = 0; attempt < this.attempts; attempt += 1) {
      try {
        const startedAt = performance.now();
        const result = await this.pool.query<T>(sql, [...params]);
        this.logQuery(sql, startedAt, result.rowCount ?? result.rows.length);
        return result.rows;
      } catch (error) {
        lastError = error;
        await this.waitBeforeRetry(attempt);
      }
    }

    if (!inMemoryDataEnabled()) {
      throw lastError instanceof Error
        ? lastError
        : new Error(String(lastError));
    }

    this.warnUnavailable(lastError);
    return null;
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  private warnUnavailable(error: unknown) {
    if (this.warned) {
      return;
    }

    this.warned = true;
    const message =
      error instanceof AggregateError
        ? error.errors
            .map((item) =>
              item instanceof Error ? item.message : String(item),
            )
            .join('; ')
        : error instanceof Error
          ? error.message
          : String(error);
    this.logger.warn(
      `Postgres ishlamadi, in-memory fallback ishlaydi: ${message}`,
    );
  }

  private async waitBeforeRetry(attempt: number) {
    if (attempt >= this.attempts - 1) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }

  private logQuery(sql: string, startedAt: number, rowCount: number) {
    const durationMs = Math.round(performance.now() - startedAt);
    if (durationMs < this.slowQueryMs) {
      return;
    }

    this.logger.warn(
      JSON.stringify({
        event: 'slow_query',
        duration_ms: durationMs,
        row_count: rowCount,
        query: summarizeSql(sql),
      }),
    );
  }
}

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function summarizeSql(sql: string): string {
  return sql
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
    .replace(/'(?:''|[^'])*'/g, "'?'");
}
