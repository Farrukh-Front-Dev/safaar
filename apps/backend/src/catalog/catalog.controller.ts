import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('regions')
  regions() {
    return this.catalogService.regions();
  }

  @Get('cities')
  cities() {
    return this.catalogService.cities();
  }

  @Get('amenities')
  amenities() {
    return this.catalogService.amenities();
  }

  @Get('room-types')
  roomTypes() {
    return this.catalogService.roomTypes();
  }

  @Get('bus-types')
  busTypes() {
    return this.catalogService.busTypes();
  }

  @Get('cancellation-policies')
  cancellationPolicies() {
    return this.catalogService.cancellationPolicies();
  }

  @Get('popular-cities')
  popularCities() {
    return this.catalogService.popularCities();
  }

  @Get('partners-showcase')
  partnersShowcase() {
    return this.catalogService.partnersShowcase();
  }
}
