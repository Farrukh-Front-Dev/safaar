import { Injectable } from '@nestjs/common';
import type { Hotel, HotelSearchQuery } from '@agoda/types';

@Injectable()
export class HotelsService {
  // TODO: PostgreSQL (TypeORM/Prisma) bilan almashtiriladi.
  private readonly hotels: Hotel[] = [
    {
      id: '1',
      name: 'Hotel Samarkand',
      city: 'Samarqand',
      pricePerNight: 450000,
      rating: 4.7,
      stars: 4,
    },
  ];

  findAll(): Hotel[] {
    return this.hotels;
  }

  findOne(id: string): Hotel | undefined {
    return this.hotels.find((h) => h.id === id);
  }

  search(query: HotelSearchQuery): Hotel[] {
    return this.hotels.filter((h) => h.city === query.city);
  }
}
