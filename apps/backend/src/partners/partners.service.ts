import { Injectable } from '@nestjs/common';

/**
 * Hamkor (mehmonxona/avtobus kompaniyasi) kabineti xizmati.
 * partner.uzbron.uz uchun: xonalar, bronlar, moliya boshqaruvi.
 */
@Injectable()
export class PartnersService {
  getDashboard(partnerId: string) {
    void partnerId;
    return {
      todayBookings: 0,
      monthRevenue: 0,
      totalCustomers: 0,
      rating: 0,
    };
  }
}
