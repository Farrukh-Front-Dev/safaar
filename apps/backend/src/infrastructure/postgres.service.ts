import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type QueryResultRow } from 'pg';
import { inMemoryDataEnabled } from '../auth/security';

@Injectable()
export class PostgresService implements OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private readonly pool?: Pool;
  private warned = false;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');

    if (!connectionString) {
      if (!inMemoryDataEnabled()) {
        throw new Error('DATABASE_URL yo‘q va in-memory fallback o‘chirilgan');
      }
      return;
    }

    this.pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 30_000,
      max: 5,
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

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const result = await this.pool.query<T>(sql, [...params]);
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
    if (attempt >= 2) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }
}
