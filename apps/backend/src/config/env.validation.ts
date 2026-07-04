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
  JWT_ACCESS_TTL: string;
  JWT_REFRESH_TTL: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  TOTP_ENCRYPTION_KEY?: string;
  OTP_PEPPER?: string;
  PARTNER_API_KEY_PEPPER?: string;
  PAYMENT_WEBHOOK_SECRET?: string;
  ENABLE_DEMO_AUTH: string;
  ENABLE_IN_MEMORY_DATA: string;
  ENABLE_MOCK_PAYMENTS: string;
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
  const production = nodeEnv === 'production';

  if (production) {
    for (const key of [
      'DATABASE_URL',
      'REDIS_URL',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'TOTP_ENCRYPTION_KEY',
      'OTP_PEPPER',
      'PARTNER_API_KEY_PEPPER',
      'PAYMENT_WEBHOOK_SECRET',
      'CORS_ORIGINS',
    ]) {
      if (!config[key]) {
        throw new Error(`${key} production muhitida majburiy`);
      }
    }

    for (const key of [
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'TOTP_ENCRYPTION_KEY',
      'OTP_PEPPER',
      'PARTNER_API_KEY_PEPPER',
      'PAYMENT_WEBHOOK_SECRET',
    ]) {
      const value = String(config[key] ?? '');
      if (value.length < 32 || value.toLowerCase().includes('change_me')) {
        throw new Error(`${key} production uchun kuchli qiymat bo'lishi kerak`);
      }
    }

    for (const key of [
      'ENABLE_DEMO_AUTH',
      'ENABLE_IN_MEMORY_DATA',
      'ENABLE_MOCK_PAYMENTS',
    ]) {
      if (String(config[key] ?? 'false').toLowerCase() === 'true') {
        throw new Error(`${key} production muhitida true bo'lishi mumkin emas`);
      }
    }

    if (String(config.CORS_ORIGINS).includes('*')) {
      throw new Error(
        'CORS_ORIGINS production muhitida * bo‘lishi mumkin emas',
      );
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
    JWT_ACCESS_TTL: String(
      config.JWT_ACCESS_TTL ?? config.JWT_ACCESS_EXPIRES_IN ?? '15m',
    ),
    JWT_REFRESH_TTL: String(
      config.JWT_REFRESH_TTL ?? config.JWT_REFRESH_EXPIRES_IN ?? '30d',
    ),
    JWT_ISSUER: String(config.JWT_ISSUER ?? 'uzbron-api'),
    JWT_AUDIENCE: String(config.JWT_AUDIENCE ?? 'uzbron-clients'),
    TOTP_ENCRYPTION_KEY: config.TOTP_ENCRYPTION_KEY
      ? String(config.TOTP_ENCRYPTION_KEY)
      : undefined,
    OTP_PEPPER: config.OTP_PEPPER ? String(config.OTP_PEPPER) : undefined,
    PARTNER_API_KEY_PEPPER: config.PARTNER_API_KEY_PEPPER
      ? String(config.PARTNER_API_KEY_PEPPER)
      : undefined,
    PAYMENT_WEBHOOK_SECRET: config.PAYMENT_WEBHOOK_SECRET
      ? String(config.PAYMENT_WEBHOOK_SECRET)
      : undefined,
    ENABLE_DEMO_AUTH: String(config.ENABLE_DEMO_AUTH ?? !production),
    ENABLE_IN_MEMORY_DATA: String(config.ENABLE_IN_MEMORY_DATA ?? !production),
    ENABLE_MOCK_PAYMENTS: String(config.ENABLE_MOCK_PAYMENTS ?? !production),
    CORS_ORIGINS: config.CORS_ORIGINS ? String(config.CORS_ORIGINS) : undefined,
    SWAGGER_ENABLED: String(config.SWAGGER_ENABLED ?? !production),
  };
}
