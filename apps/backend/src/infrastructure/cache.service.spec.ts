import { ConfigService } from '@nestjs/config';
import { AppCacheService } from './cache.service';

describe('AppCacheService.take', () => {
  it('returns a local value only once', async () => {
    const config = {
      get: (key: string) =>
        key === 'CACHE_ENABLED'
          ? 'true'
          : key === 'CACHE_DEFAULT_TTL_SECONDS'
            ? '60'
            : undefined,
    };
    const cache = new AppCacheService(config as unknown as ConfigService);

    await cache.set('one-time-code', { userId: 'user-1' }, 60);

    await expect(cache.take('one-time-code')).resolves.toEqual({
      userId: 'user-1',
    });
    await expect(cache.take('one-time-code')).resolves.toBeUndefined();
  });
});
