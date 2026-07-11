import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type QueryResultRow } from 'pg';

@Injectable()
export class PostgresService implements OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private readonly pool: Pool;
  private readonly slowQueryMs: number;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    const connectionTimeoutMillis = toPositiveInt(
      config.get<string>('DB_CONNECTION_TIMEOUT_MS'),
      8_000,
    );
    const queryTimeoutMillis = toPositiveInt(
      config.get<string>('DB_QUERY_TIMEOUT_MS'),
      8_000,
    );
    const max = toPositiveInt(config.get<string>('DB_POOL_MAX'), 5);
    const idleTimeoutMillis = toPositiveInt(
      config.get<string>('DB_IDLE_TIMEOUT_MS'),
      10_000,
    );
    this.slowQueryMs = toPositiveInt(config.get<string>('SLOW_QUERY_MS'), 300);

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL talab qilinadi — Neon PostgreSQL URL ni .env faylida belgilang',
      );
    }

    this.pool = new Pool({
      connectionString,
      connectionTimeoutMillis,
      idleTimeoutMillis,
      query_timeout: queryTimeoutMillis,
      statement_timeout: queryTimeoutMillis,
      max,
    });

    this.pool.on('error', (error: Error) => {
      this.logger.error(`Pool xatosi: ${error.message}`);
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: readonly unknown[] = [],
  ): Promise<T[]> {
    let lastError: unknown;
    const attempts = 3;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const startedAt = performance.now();
        const result = await this.pool.query<T>(sql, [...params]);
        this.logQuery(sql, startedAt, result.rowCount ?? result.rows.length);
        return result.rows;
      } catch (error) {
        lastError = error;
        if (attempt < attempts - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, 300 * (attempt + 1)),
          );
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  async onModuleDestroy() {
    await this.pool.end();
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
