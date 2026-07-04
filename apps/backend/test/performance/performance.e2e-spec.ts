import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('Backend performance smoke (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = '';
    process.env.REDIS_URL = '';
    process.env.QUEUE_REDIS_URL = '';
    process.env.ENABLE_DEMO_AUTH = 'true';
    process.env.ENABLE_IN_MEMORY_DATA = 'true';
    process.env.CACHE_ENABLED = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps hot public endpoints under the local smoke threshold', async () => {
    await expectEndpoint('/health', 500);
    await expectEndpoint('/catalog/cities', 1000);
    await expectEndpoint('/hotels?limit=2', 1000);
    await expectEndpoint('/bus-trips?limit=2', 1000);
  });

  it('keeps admin dashboard/list endpoints under the local smoke threshold', async () => {
    const adminHeaders = {
      'x-user-role': 'SUPER_ADMIN',
      'x-user-id': 'demo-admin-id',
    };

    await expectEndpoint('/admin/dashboard/overview', 1000, adminHeaders);
    await expectEndpoint('/admin/users?limit=2', 1000, adminHeaders);
    await expectEndpoint('/admin/bookings?limit=2', 1000, adminHeaders);
  });

  it('respects public and admin list limits', async () => {
    const hotels = await request(app.getHttpServer()).get('/hotels?limit=2');
    const hotelsBody: unknown = hotels.body;
    expect(hotels.status).toBe(200);
    expect(hasItems(hotelsBody)).toBe(true);
    if (!hasItems(hotelsBody)) {
      throw new Error('Hotels response items yo‘q');
    }
    expect(hotelsBody.items.length).toBeLessThanOrEqual(2);

    const busTrips = await request(app.getHttpServer()).get(
      '/bus-trips?limit=1',
    );
    const busTripsBody: unknown = busTrips.body;
    expect(busTrips.status).toBe(200);
    expect(Array.isArray(busTripsBody)).toBe(true);
    if (!Array.isArray(busTripsBody)) {
      throw new Error('Bus trips response array emas');
    }
    expect(busTripsBody.length).toBeLessThanOrEqual(1);

    const users = await request(app.getHttpServer())
      .get('/admin/users?limit=2')
      .set('x-user-role', 'SUPER_ADMIN')
      .set('x-user-id', 'demo-admin-id');
    const usersBody: unknown = users.body;
    expect(users.status).toBe(200);
    expect(Array.isArray(usersBody)).toBe(true);
    if (!Array.isArray(usersBody)) {
      throw new Error('Users response array emas');
    }
    expect(usersBody.length).toBeLessThanOrEqual(2);
  });

  async function expectEndpoint(
    path: string,
    thresholdMs: number,
    headers: Record<string, string> = {},
  ) {
    const durations: number[] = [];

    for (let index = 0; index < 3; index += 1) {
      const startedAt = performance.now();
      const response = await request(app.getHttpServer())
        .get(path)
        .set(headers);
      durations.push(performance.now() - startedAt);
      expect(response.status).toBe(200);
    }

    const max = Math.max(...durations);
    expect(max).toBeLessThan(thresholdMs);
  }
});

function hasItems(value: unknown): value is { items: unknown[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    Array.isArray((value as { items?: unknown }).items)
  );
}
