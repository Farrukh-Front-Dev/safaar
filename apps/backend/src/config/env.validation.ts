interface EnvironmentConfig {
  NODE_ENV: string;
  APP_NAME: string;
  PORT: number;
  API_PREFIX: string;
  BUSINESS_TIMEZONE: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  JWT_ACCESS_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  CORS_ORIGINS?: string;
  SWAGGER_ENABLED: string;
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentConfig {
  const nodeEnv = String(config.NODE_ENV ?? 'development');

  if (nodeEnv === 'production') {
    for (const key of [
      'DATABASE_URL',
      'REDIS_URL',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
    ]) {
      if (!config[key]) {
        throw new Error(`${key} production muhitida majburiy`);
      }
    }
  }

  return {
    NODE_ENV: nodeEnv,
    APP_NAME: String(config.APP_NAME ?? 'uzbron-api'),
    PORT: toNumber(config.PORT, 4000),
    API_PREFIX: String(config.API_PREFIX ?? 'v1'),
    BUSINESS_TIMEZONE: String(config.BUSINESS_TIMEZONE ?? 'Asia/Tashkent'),
    DATABASE_URL: config.DATABASE_URL ? String(config.DATABASE_URL) : undefined,
    REDIS_URL: config.REDIS_URL ? String(config.REDIS_URL) : undefined,
    JWT_ACCESS_SECRET: config.JWT_ACCESS_SECRET
      ? String(config.JWT_ACCESS_SECRET)
      : undefined,
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET
      ? String(config.JWT_REFRESH_SECRET)
      : undefined,
    CORS_ORIGINS: config.CORS_ORIGINS ? String(config.CORS_ORIGINS) : undefined,
    SWAGGER_ENABLED: String(config.SWAGGER_ENABLED ?? 'true'),
  };
}
