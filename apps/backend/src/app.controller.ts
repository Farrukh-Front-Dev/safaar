import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health/live')
  getLive() {
    return this.appService.getLive();
  }

  @Get('health/ready')
  getReady() {
    return this.appService.getReady();
  }
}
