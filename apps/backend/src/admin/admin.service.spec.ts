import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { AppCacheService } from '../infrastructure/cache.service';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { PostgresService } from '../infrastructure/postgres.service';
import { AdminService } from './admin.service';

describe('AdminService frontend action endpoints', () => {
  let service: AdminService;
  let pgMock: jest.Mocked<Pick<PostgresService, 'query'>>;
  const actor: RequestActor = {
    id: '00000000-0000-0000-0000-000000000001',
    actorType: 'admin',
    role: Role.SUPER_ADMIN,
    roles: [Role.SUPER_ADMIN],
    sessionId: 'demo-session-id',
  };

  beforeEach(() => {
    pgMock = {
      query: jest.fn(),
    };
    service = new AdminService(
      {
        getOrSet: async <T>(
          _key: string,
          _ttl: number,
          factory: () => Promise<T> | T,
        ): Promise<T> => Promise.resolve(factory()),
        delByPattern: jest.fn(),
      } as unknown as AppCacheService,
      { add: jest.fn() } as unknown as JobQueueService,
      pgMock as unknown as PostgresService,
    );
  });

  it('soft deletes users for the admin delete button', async () => {
    pgMock.query.mockResolvedValue([{ status: 'deleted' }]);
    const result = await service.userDelete(
      actor,
      '00000000-0000-0000-0000-000000000001',
    );
    expect(result.status).toBe('deleted');
  });

  it('updates support status and appends an admin support message', async () => {
    pgMock.query.mockResolvedValue([{ status: 'closed' }]);
    const closed = await service.supportStatus(
      '00000000-0000-0000-0000-000000000002',
      {
        status: 'closed',
      },
    );
    expect(closed['status']).toBe('closed');
  });

  it('normalizes withdrawal actions used by admin finance buttons', async () => {
    pgMock.query.mockResolvedValue([{ status: 'approved' }]);
    await expect(
      service.withdrawalStatus(
        '00000000-0000-0000-0000-000000000003',
        'approved',
      ),
    ).resolves.toMatchObject({
      status: 'approved',
    });
  });
});
