import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { PartnersService } from './partners.service';

describe('PartnersService frontend action endpoints', () => {
  let service: PartnersService;
  let db: InMemoryDbService;
  const actor: RequestActor = {
    id: 'demo-partner-user-id',
    actorType: 'partner',
    role: Role.PARTNER,
    roles: [Role.PARTNER],
    organizationId: 'demo-partner-org-id',
    sessionId: 'demo-session-id',
  };

  beforeEach(() => {
    db = new InMemoryDbService();
    service = new PartnersService(db, {
      add: jest.fn(),
    } as unknown as JobQueueService);
  });

  it('supports room type and bulk room buttons from the partner listing UI', () => {
    const roomType = service.createRoomType(actor, 'hotel-samarkand-plaza', {
      name: 'Deluxe',
    });
    const bulk = service.createRoomsBulk(actor, 'hotel-samarkand-plaza', {
      roomTypeId: roomType.id,
      startNumber: 301,
      count: 2,
      basePrice: 90000000,
    });

    expect(roomType.name.uz).toBe('Deluxe');
    expect(bulk).toMatchObject({ ok: true, added: 2 });
    expect(db.rooms.some((room) => room.code === '301')).toBe(true);
  });

  it('updates listing sections and publish status for partner listing UI', () => {
    const general = service.updateListingGeneral(
      actor,
      'hotel-samarkand-plaza',
      {
        name: 'Yangi nom',
        description: 'Batafsil tavsif',
        stars: 5,
      },
    );
    const published = service.publishListing(actor, 'hotel-samarkand-plaza');

    expect(general.name.uz).toBe('Yangi nom');
    expect(general.stars).toBe(5);
    expect(published.status).toBe('pending_review');
  });
});
