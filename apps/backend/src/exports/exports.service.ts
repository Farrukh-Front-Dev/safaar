import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
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

  findOne(actor: RequestActor | undefined, id: string) {
    return this.assertJob(actor, id);
  }

  download(actor: RequestActor | undefined, id: string) {
    const job = this.assertJob(actor, id);
    job.status = 'ready';
    job.download_url = `https://api.uzbron.uz/v1/exports/${id}/mock-download`;
    return job;
  }

  delete(actor: RequestActor | undefined, id: string) {
    const job = this.assertJob(actor, id);
    job.status = 'deleted';
    return job;
  }

  private assertJob(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    const job = this.db.exportJobs.find((item) => item.id === id);
    if (!job) {
      throw new NotFoundException({
        code: 'EXPORT_NOT_READY',
        message: 'Export hali tayyor emas',
      });
    }

    if (
      currentActor.role !== Role.SUPER_ADMIN &&
      currentActor.actorType !== 'admin' &&
      job.owner_id !== currentActor.id
    ) {
      throw new ForbiddenException({
        code: 'EXPORT_FORBIDDEN',
        message: 'Bu export sizga tegishli emas',
      });
    }

    return job;
  }
}
