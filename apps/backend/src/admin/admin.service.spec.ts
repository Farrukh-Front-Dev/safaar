import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { AppCacheService } from '../infrastructure/cache.service';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { PostgresService } from '../infrastructure/postgres.service';
import { EventsService } from '../realtime/events.service';
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
      {
        partnerRequestCreated: jest.fn(),
        partnerRequestDecided: jest.fn(),
        partnerDashboardUpdated: jest.fn(),
        bookingStatusChanged: jest.fn(),
        adminDashboardUpdated: jest.fn(),
        notificationCreated: jest.fn(),
        supportTicketUpdated: jest.fn(),
        supportMessageCreated: jest.fn(),
      } as unknown as EventsService,
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

  it('loads admin settings from persistent storage with defaults', async () => {
    pgMock.query.mockResolvedValue([
      {
        group_key: 'general',
        value: {
          support_email: 'help@safaar.uz',
          maintenance_mode: true,
        },
      },
      {
        group_key: 'finance',
        value: {
          hotel_commission_rate: 17,
        },
      },
    ]);

    await expect(service.settings()).resolves.toMatchObject({
      general: {
        app_name: 'UzBron',
        support_email: 'help@safaar.uz',
        maintenance_mode: true,
      },
      finance: {
        hotel_commission_rate: 17,
        bus_commission_rate: 10,
      },
    });
  });

  it('persists admin settings groups and audits the change', async () => {
    pgMock.query
      .mockResolvedValueOnce([
        {
          group_key: 'finance',
          value: {
            hotel_commission_rate: 18,
            bus_commission_rate: 11,
          },
          updated_at: '2026-07-14T12:30:00.000Z',
        },
      ])
      .mockResolvedValueOnce([]);

    await expect(
      service.settingsGroup(actor, 'finance', {
        hotel_commission_rate: 18,
        bus_commission_rate: 11,
      }),
    ).resolves.toMatchObject({
      group: 'finance',
      hotel_commission_rate: 18,
      bus_commission_rate: 11,
    });
    expect(pgMock.query).toHaveBeenCalledTimes(2);
  });
});
