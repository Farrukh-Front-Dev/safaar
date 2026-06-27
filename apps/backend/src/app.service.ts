import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; service: string } {
    return { status: 'ok', service: 'uzbron-api' };
  }

  getLive() {
    return {
      status: 'ok',
      service: 'uzbron-api',
      check: 'live',
      timestamp: new Date().toISOString(),
    };
  }

  getReady() {
    return {
      status: 'ok',
      service: 'uzbron-api',
      check: 'ready',
      dependencies: {
        database: 'mock-ready',
        redis: 'mock-ready',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
