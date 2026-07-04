import { Global, Module } from '@nestjs/common';
import { InMemoryDbService } from './in-memory-db.service';
import { PostgresService } from './postgres.service';

@Global()
@Module({
  providers: [InMemoryDbService, PostgresService],
  exports: [InMemoryDbService, PostgresService],
})
export class InfrastructureModule {}
