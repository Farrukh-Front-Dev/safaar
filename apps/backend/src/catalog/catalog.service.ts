import { Injectable } from '@nestjs/common';
import { AppCacheService } from '../infrastructure/cache.service';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly cache: AppCacheService,
    private readonly db: InMemoryDbService,
    private readonly postgres: PostgresService,
  ) {}

  async regions() {
    return this.cache.getOrSet('catalog:regions', 3600, async () => {
      const rows = await this.postgres.tryQuery(`
        select id::text, name, created_at, updated_at
        from regions
        order by name ->> 'uz'
      `);
      return rows ?? this.db.regions;
    });
  }

  async cities() {
    return this.cache.getOrSet('catalog:cities', 3600, async () => {
      const rows = await this.postgres.tryQuery(`
        select id::text, region_id::text, name, created_at, updated_at
        from cities
        order by name ->> 'uz'
      `);
      return rows ?? this.db.cities;
    });
  }

  async amenities() {
    return this.cache.getOrSet('catalog:amenities', 3600, async () => {
      const rows = await this.postgres.tryQuery(`
        select id::text, code, name, created_at, updated_at
        from amenities
        order by name ->> 'uz'
      `);
      return rows ?? this.db.amenities;
    });
  }

  async roomTypes() {
    return this.cache.getOrSet('catalog:room-types', 3600, async () => {
      const rows = await this.postgres.tryQuery(`
        select id::text, code, name, created_at, updated_at
        from room_types
        order by name ->> 'uz'
      `);
      return rows ?? this.db.roomTypes;
    });
  }

  busTypes() {
    return this.cache.getOrSet('catalog:bus-types', 3600, () => {
      return this.db.busTypes;
    });
  }

  cancellationPolicies() {
    return this.cache.getOrSet('catalog:cancellation-policies', 3600, () => {
      return this.db.cancellationPolicies;
    });
  }
}
