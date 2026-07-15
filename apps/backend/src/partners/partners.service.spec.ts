import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { PostgresService } from '../infrastructure/postgres.service';
import { PartnersService } from './partners.service';

describe('PartnersService frontend action endpoints', () => {
  let service: PartnersService;
  let pgMock: jest.Mocked<Pick<PostgresService, 'query'>>;
  const actor: RequestActor = {
    id: '00000000-0000-0000-0000-000000000001',
    actorType: 'partner',
    role: Role.PARTNER,
    roles: [Role.PARTNER],
    organizationId: '00000000-0000-0000-0000-000000000002',
    sessionId: 'demo-session-id',
  };
  const hotelId = '00000000-0000-0000-0000-000000000003';
  const hotelRow = {
    id: hotelId,
    partner_organization_id: '00000000-0000-0000-0000-000000000002',
    name: { uz: 'Old', ru: 'Old', en: 'Old' },
    description: { uz: '', ru: '', en: '' },
    stars: 3,
    address: '',
    latitude: 0,
    longitude: 0,
    amenities: [],
    images: [],
    status: 'draft',
    check_in_time: '14:00',
    check_out_time: '12:00',
  };

  beforeEach(() => {
    pgMock = {
      query: jest.fn().mockResolvedValue([hotelRow]),
    };
    service = new PartnersService(
      pgMock as unknown as PostgresService,
      { add: jest.fn() } as unknown as JobQueueService,
    );
  });

  it('supports room type and bulk room buttons from the partner listing UI', async () => {
    pgMock.query
      .mockResolvedValueOnce([hotelRow])
      .mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000004',
          code: 'deluxe',
          name: { uz: 'Deluxe', ru: 'Deluxe', en: 'Deluxe' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .mockResolvedValueOnce([hotelRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const roomType = await service.createRoomType(actor, hotelId, {
      name: 'Deluxe',
    });
    const bulk = await service.createRoomsBulk(actor, hotelId, {
      roomTypeId: roomType.id,
      startNumber: 301,
      count: 2,
      basePrice: 90000000,
    });

    expect((roomType.name as { uz: string }).uz).toBe('Deluxe');
    expect(bulk).toMatchObject({ ok: true, added: 2 });
  });

  it('updates listing sections and publish status for partner listing UI', async () => {
    await service.updateListingGeneral(actor, hotelId, {
      name: 'Yangi nom',
      description: 'Batafsil tavsif',
      stars: 5,
    });

    expect(pgMock.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE hotels'),
      expect.arrayContaining([5, expect.any(String), hotelId]),
    );
  });
});
