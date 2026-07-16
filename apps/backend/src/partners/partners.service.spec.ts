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

  it('rejects review submission until every listing section is complete', async () => {
    pgMock.query
      .mockResolvedValueOnce([hotelRow])
      .mockResolvedValueOnce([
        {
          name: 'Hotel',
          short_description: 'Qisqa tavsif',
          description: 'Batafsil tavsif',
        },
      ])
      .mockResolvedValueOnce([{ count: 3 }])
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ count: 1 }]);

    await expect(
      service.updateListingStatus(actor, hotelId, { status: 'UNDER_REVIEW' }),
    ).rejects.toThrow("E'lon to'liq to'ldirilmagan");
  });

  it('writes submitted_at when a complete listing enters review', async () => {
    const completeHotel = {
      ...hotelRow,
      address: 'Samarqand, Registon kochasi 1',
      latitude: 39.65,
      longitude: 66.96,
      rules_completed_at: new Date().toISOString(),
    };
    pgMock.query
      .mockResolvedValueOnce([completeHotel])
      .mockResolvedValueOnce([
        {
          name: 'Hotel',
          short_description: 'Yetarlicha uzun qisqa tavsif matni',
          description:
            'Bu mehmonxona haqida mijozga ko‘rinadigan yetarlicha uzun batafsil tavsif matni mavjud. Mehmonlar uchun muhim xizmatlar va qulayliklar batafsil tushuntiriladi.',
        },
      ])
      .mockResolvedValueOnce([{ count: 3 }])
      .mockResolvedValueOnce([{ count: 3 }])
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ ...completeHotel, status: 'pending_review' }]);

    const result = await service.updateListingStatus(actor, hotelId, {
      status: 'UNDER_REVIEW',
    });

    expect(result).toMatchObject({ status: 'pending_review' });
    expect(pgMock.query).toHaveBeenLastCalledWith(
      expect.stringContaining('submitted_at = CASE'),
      expect.arrayContaining(['pending_review', expect.any(String), hotelId]),
    );
  });

  it('rejects amenity codes that are not in the catalog', async () => {
    pgMock.query
      .mockResolvedValueOnce([hotelRow])
      .mockResolvedValueOnce([
        { code: 'wifi', id: '00000000-0000-0000-0000-000000000004' },
      ]);

    await expect(
      service.updateListingAmenities(actor, hotelId, {
        amenities: ['wifi', 'unknown-amenity'],
      }),
    ).rejects.toThrow('Qulayliklar katalogdan topilmadi');
  });
});
