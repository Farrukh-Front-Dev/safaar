import { Injectable } from '@nestjs/common';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly db: InMemoryDbService,
    private readonly postgres: PostgresService,
  ) {}

  async regions() {
    const rows = await this.postgres.tryQuery(`
      select id::text, name, created_at, updated_at
      from regions
      order by name ->> 'uz'
    `);
    return rows ?? this.db.regions;
  }

  async cities() {
    const rows = await this.postgres.tryQuery(`
      select id::text, region_id::text, name, created_at, updated_at
      from cities
      order by name ->> 'uz'
    `);
    return rows ?? this.db.cities;
  }

  async amenities() {
    const rows = await this.postgres.tryQuery(`
      select id::text, code, name, created_at, updated_at
      from amenities
      order by name ->> 'uz'
    `);
    return rows ?? this.db.amenities;
  }

  async roomTypes() {
    const rows = await this.postgres.tryQuery(`
      select id::text, code, name, created_at, updated_at
      from room_types
      order by name ->> 'uz'
    `);
    return rows ?? this.db.roomTypes;
  }

  busTypes() {
    return this.db.busTypes;
  }

  cancellationPolicies() {
    return this.db.cancellationPolicies;
  }
}
