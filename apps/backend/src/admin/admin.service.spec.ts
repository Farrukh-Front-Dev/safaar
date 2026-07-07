import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { AppCacheService } from '../infrastructure/cache.service';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { PostgresService } from '../infrastructure/postgres.service';
import { AdminService } from './admin.service';

describe('AdminService frontend action endpoints', () => {
  let service: AdminService;
  let db: InMemoryDbService;
  const actor: RequestActor = {
    id: 'demo-admin-id',
    actorType: 'admin',
    role: Role.SUPER_ADMIN,
    roles: [Role.SUPER_ADMIN],
    sessionId: 'demo-session-id',
  };

  beforeEach(() => {
    db = new InMemoryDbService();
    service = new AdminService(
      {
        getOrSet: async <T>(
          _key: string,
          _ttl: number,
          factory: () => Promise<T> | T,
        ): Promise<T> => Promise.resolve(factory()),
        delByPattern: jest.fn(),
      } as unknown as AppCacheService,
      db,
      { add: jest.fn() } as unknown as JobQueueService,
      {
        tryQuery: jest.fn().mockResolvedValue(null),
      } as unknown as PostgresService,
    );
  });

  it('soft deletes users for the admin delete button', async () => {
    const result = await service.userDelete(actor, 'demo-user-id');

    expect(result.status).toBe('deleted');
    expect(db.findUser('demo-user-id')?.status).toBe('deleted');
  });

  it('updates support status and appends an admin support message', async () => {
    db.supportTickets.push({
      id: 'ticket-demo',
      user_id: 'demo-user-id',
      subject: 'Yordam kerak',
      priority: 'medium',
      status: 'open',
      created_at: db.now(),
      updated_at: db.now(),
    });

    const closed = await service.supportStatus('ticket-demo', {
      status: 'closed',
    });
    expect(closed['status']).toBe('closed');

    const message = await service.supportMessage(actor, 'ticket-demo', {
      message: 'Tekshirildi',
    });

    expect(message['message']).toBe('Tekshirildi');
    expect(db.supportTickets[0]['status']).toBe('in_progress');
  });

  it('normalizes withdrawal actions used by admin finance buttons', async () => {
    await expect(
      service.withdrawalStatus('withdrawal-demo', 'approved'),
    ).resolves.toMatchObject({
      id: 'withdrawal-demo',
      status: 'approved',
    });
  });
});
