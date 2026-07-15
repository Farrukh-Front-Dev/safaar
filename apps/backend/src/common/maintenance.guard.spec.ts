import { ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { Role } from '@agoda/types';
import { AppCacheService } from '../infrastructure/cache.service';
import { PostgresService } from '../infrastructure/postgres.service';
import { MaintenanceGuard } from './maintenance.guard';

function contextFor(
  url: string,
  headers: Record<string, string> = {},
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        url,
        headers,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('MaintenanceGuard', () => {
  let guard: MaintenanceGuard;
  let pgMock: jest.Mocked<Pick<PostgresService, 'query'>>;
  const originalDemoAuth = process.env.ENABLE_DEMO_AUTH;

  beforeEach(() => {
    pgMock = {
      query: jest.fn(),
    };
    guard = new MaintenanceGuard(
      {
        getOrSet: async <T>(
          _key: string,
          _ttl: number,
          factory: () => Promise<T> | T,
        ): Promise<T> => Promise.resolve(factory()),
      } as unknown as AppCacheService,
      pgMock as unknown as PostgresService,
    );
  });

  afterEach(() => {
    process.env.ENABLE_DEMO_AUTH = originalDemoAuth;
  });

  it('blocks public API requests when maintenance mode is enabled', async () => {
    pgMock.query.mockResolvedValue([{ maintenance_mode: true }]);

    await expect(
      guard.canActivate(contextFor('/v1/hotels')),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('allows admin endpoints during maintenance mode', async () => {
    await expect(
      guard.canActivate(contextFor('/v1/admin/settings')),
    ).resolves.toBe(true);
    expect(pgMock.query).not.toHaveBeenCalled();
  });

  it('allows public settings during maintenance mode', async () => {
    await expect(
      guard.canActivate(contextFor('/v1/settings/public')),
    ).resolves.toBe(true);
    expect(pgMock.query).not.toHaveBeenCalled();
  });

  it('allows admin actors to call non-admin endpoints during maintenance mode', async () => {
    process.env.ENABLE_DEMO_AUTH = 'true';

    await expect(
      guard.canActivate(
        contextFor('/v1/notifications', {
          'x-user-role': Role.SUPER_ADMIN,
        }),
      ),
    ).resolves.toBe(true);
    expect(pgMock.query).not.toHaveBeenCalled();
  });
});
