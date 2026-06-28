import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class ExportsService {
  constructor(private readonly db: InMemoryDbService) {}

  create(ownerId: string, type: string, format: 'csv' | 'xlsx' | 'pdf') {
    const job = {
      id: this.db.id('export'),
      owner_id: ownerId,
      type,
      format,
      status: 'queued' as const,
      created_at: this.db.now(),
      updated_at: this.db.now(),
    };
    this.db.exportJobs.unshift(job);
    return job;
  }

  findOne(id: string) {
    return this.assertJob(id);
  }

  download(id: string) {
    const job = this.assertJob(id);
    job.status = 'ready';
    job.download_url = `https://api.uzbron.uz/v1/exports/${id}/mock-download`;
    return job;
  }

  delete(id: string) {
    const job = this.assertJob(id);
    job.status = 'deleted';
    return job;
  }

  private assertJob(id: string) {
    const job = this.db.exportJobs.find((item) => item.id === id);
    if (!job) {
      throw new NotFoundException({
        code: 'EXPORT_NOT_READY',
        message: 'Export hali tayyor emas',
      });
    }

    return job;
  }
}
