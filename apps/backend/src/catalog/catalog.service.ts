import { Injectable } from '@nestjs/common';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class CatalogService {
  constructor(private readonly db: InMemoryDbService) {}

  regions() {
    return this.db.regions;
  }

  cities() {
    return this.db.cities;
  }

  amenities() {
    return this.db.amenities;
  }

  roomTypes() {
    return this.db.roomTypes;
  }

  busTypes() {
    return this.db.busTypes;
  }

  cancellationPolicies() {
    return this.db.cancellationPolicies;
  }
}
