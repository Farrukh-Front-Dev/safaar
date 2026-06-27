import { Injectable } from '@nestjs/common';

/**
 * Super Admin xizmati — admin.uzbron.uz.
 * Platforma statistikasi, hamkor tasdiqlash, moliya hisobotlari.
 */
@Injectable()
export class AdminService {
  getOverview() {
    return {
      totalUsers: 0,
      activePartners: 0,
      todayBookings: 0,
      monthlyRevenue: 0,
    };
  }
}
