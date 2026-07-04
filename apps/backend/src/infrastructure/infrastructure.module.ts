import { Global, Module } from '@nestjs/common';
import { AppCacheService } from './cache.service';
import { InMemoryDbService } from './in-memory-db.service';
import { JobQueueService } from './job-queue.service';
import { PostgresService } from './postgres.service';

@Global()
@Module({
  providers: [
    AppCacheService,
    InMemoryDbService,
    JobQueueService,
    PostgresService,
  ],
  exports: [
    AppCacheService,
    InMemoryDbService,
    JobQueueService,
    PostgresService,
  ],
})
export class InfrastructureModule {}
