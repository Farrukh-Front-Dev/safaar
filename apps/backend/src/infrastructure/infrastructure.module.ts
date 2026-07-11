import { Global, Module } from '@nestjs/common';
import { AppCacheService } from './cache.service';
import { JobQueueService } from './job-queue.service';
import { PostgresService } from './postgres.service';

@Global()
@Module({
  providers: [AppCacheService, JobQueueService, PostgresService],
  exports: [AppCacheService, JobQueueService, PostgresService],
})
export class InfrastructureModule {}
