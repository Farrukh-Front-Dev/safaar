import { Injectable } from '@nestjs/common';
import { AppCacheService } from '../infrastructure/cache.service';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly cache: AppCacheService,
    private readonly postgres: PostgresService,
  ) {}

  async regions() {
    return this.cache.getOrSet('catalog:regions', 3600, async () => {
      return this.postgres.query(`
        select id::text, name, created_at, updated_at
        from regions
        order by name ->> 'uz'
      `);
    });
  }

  async cities() {
    return this.cache.getOrSet('catalog:cities', 3600, async () => {
      return this.postgres.query(`
        select id::text, region_id::text, name, created_at, updated_at
        from cities
        order by name ->> 'uz'
      `);
    });
  }

  async amenities() {
    return this.cache.getOrSet('catalog:amenities', 3600, async () => {
      return this.postgres.query(`
        select id::text, code, name, created_at, updated_at
        from amenities
        order by name ->> 'uz'
      `);
    });
  }

  async roomTypes() {
    return this.cache.getOrSet('catalog:room-types', 3600, async () => {
      return this.postgres.query(`
        select id::text, code, name, created_at, updated_at
        from room_types
        order by name ->> 'uz'
      `);
    });
  }

  async busTypes() {
    return this.cache.getOrSet('catalog:bus-types', 3600, async () => {
      return this.postgres.query(`
        select id::text, code, name, created_at, updated_at
        from bus_types
        order by name ->> 'uz'
      `);
    });
  }

  async cancellationPolicies() {
    return this.cache.getOrSet(
      'catalog:cancellation-policies',
      3600,
      async () => {
        return this.postgres.query(`
        select id::text, name, rules, refundable_until_hours, created_at, updated_at
        from cancellation_policies
        order by name ->> 'uz'
      `);
      },
    );
  }

  async popularCities() {
    return this.cache.getOrSet('catalog:popular-cities', 3600, async () => {
      return this.postgres.query(`
        SELECT c.id::text, c.name, c.slug, c.image_url,
          c.sort_order,
          COUNT(h.id)::int as hotel_count
        FROM cities c
        LEFT JOIN hotels h ON h.city_id = c.id AND h.status = 'published'
        GROUP BY c.id, c.name, c.slug, c.image_url, c.sort_order
        ORDER BY c.sort_order, hotel_count DESC
      `);
    });
  }

  async partnersShowcase() {
    return this.cache.getOrSet('catalog:partners-showcase', 3600, async () => {
      return this.postgres.query(`
        SELECT po.id::text, po.brand_name as company_name,
          po.logo_url, po.type, 0 as sort_order
        FROM partner_organizations po
        WHERE po.status = 'approved' AND po.showcase = true
        ORDER BY po.brand_name
      `);
    });
  }
}
