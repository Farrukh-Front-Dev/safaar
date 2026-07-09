import { Injectable } from '@nestjs/common';
import { AppCacheService } from '../infrastructure/cache.service';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly cache: AppCacheService,
    private readonly postgres: PostgresService,
  ) {}

  async getPublic() {
    return this.cache.getOrSet('stats:public', 3600, async () => {
      const rows = await this.postgres.query(`
        SELECT
          (SELECT COUNT(*)::int FROM hotels WHERE status = 'published') as total_hotels,
          (SELECT COUNT(*)::int FROM cities) as total_cities,
          (SELECT COALESCE(AVG(rating_average)::numeric(3,2), 0) FROM hotels WHERE status = 'published') as average_rating,
          (SELECT COUNT(*)::int FROM bookings) as total_bookings,
          (SELECT COUNT(*)::int FROM partner_organizations WHERE status = 'approved') as total_partners
      `);

      return rows[0];
    });
  }
}
