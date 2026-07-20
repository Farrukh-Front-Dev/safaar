import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Role } from '@safaar/types';
import type { RequestActor } from '../common/actor';
import {
  parsePagination,
  limitOffsetSql,
  type QueryLike,
} from '../common/pagination';
import { PostgresService } from '../infrastructure/postgres.service';
import { JobQueueService } from '../infrastructure/job-queue.service';

@Injectable()
export class UsersService {
  private readonly notificationPreferencesStore = new Map<
    string,
    Record<string, boolean>
  >();

  constructor(
    private readonly pg: PostgresService,
    private readonly jobs: JobQueueService,
  ) {}

  private actorOrDemo(actor: RequestActor | undefined): RequestActor {
    return (
      actor ?? {
        id: '00000000-0000-0000-0000-000000000000',
        actorType: 'user',
        role: Role.USER,
        roles: [Role.USER],
      }
    );
  }

  async profile(actor: RequestActor | undefined) {
    const currentActor = this.actorOrDemo(actor);
    return this.assertUser(currentActor.id);
  }

  async updateProfile(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const currentActor = this.actorOrDemo(actor);
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (body.first_name !== undefined) {
      sets.push(`first_name = $${idx++}`);
      params.push(String(body.first_name));
    }
    if (body.last_name !== undefined) {
      sets.push(`last_name = $${idx++}`);
      params.push(String(body.last_name));
    }
    if (body.email !== undefined) {
      sets.push(`email = $${idx++}`);
      params.push(String(body.email).toLowerCase());
    }
    sets.push(`updated_at = $${idx++}`);
    params.push(new Date().toISOString());
    params.push(currentActor.id);

    const sql = `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const [user] = await this.pg.query(sql, params);

    if (!user) {
      throw new NotFoundException({
        code: 'USER_BLOCKED',
        message: 'User topilmadi',
      });
    }

    return user;
  }

  setAvatar(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.actorOrDemo(actor);
    return {
      user_id: currentActor.id,
      avatar_media_id: String(body.media_id ?? randomUUID()),
      uploaded: true,
    };
  }

  deleteAvatar(actor: RequestActor | undefined) {
    const currentActor = this.actorOrDemo(actor);
    return { user_id: currentActor.id, deleted: true };
  }

  async bookings(actor: RequestActor | undefined, query: QueryLike = {}) {
    const currentActor = this.actorOrDemo(actor);
    const pagination = parsePagination(query, 'public', {
      defaultLimit: 20,
      allowedSortBy: ['created_at', 'updated_at', 'status'],
    });
    const orderDir = pagination.order === 'asc' ? 'ASC' : 'DESC';
    const allowedSort = ['created_at', 'updated_at', 'status'];
    const sortCol = allowedSort.includes(pagination.sortBy)
      ? pagination.sortBy
      : 'created_at';

    const sql = `SELECT * FROM bookings WHERE user_id = $1 ORDER BY ${sortCol} ${orderDir} ${limitOffsetSql(pagination)}`;
    return this.pg.query(sql, [currentActor.id]);
  }

  async booking(actor: RequestActor | undefined, id: string) {
    const currentActor = this.actorOrDemo(actor);
    const [booking] = await this.pg.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, currentActor.id],
    );

    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }

    return booking;
  }

  bonuses(_actor: RequestActor | undefined) {
    return {
      balance: 0,
      currency: 'UZS',
      ledger: [],
    };
  }

  async favorites(actor: RequestActor | undefined, query: QueryLike = {}) {
    const currentActor = this.actorOrDemo(actor);
    const pagination = parsePagination(query, 'public', {
      defaultLimit: 20,
      allowedSortBy: ['created_at'],
    });
    const orderDir = pagination.order === 'asc' ? 'ASC' : 'DESC';

    const sql = `SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at ${orderDir} ${limitOffsetSql(pagination)}`;
    return this.pg.query(sql, [currentActor.id]);
  }

  async addFavorite(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const currentActor = this.actorOrDemo(actor);
    const id = randomUUID();
    const targetType = String(body.target_type ?? 'hotel');
    const targetId = String(body.target_id ?? body.hotel_id ?? '');
    const createdAt = new Date().toISOString();

    await this.pg.query(
      'INSERT INTO favorites (id, user_id, target_type, target_id, created_at) VALUES ($1, $2, $3, $4, $5)',
      [id, currentActor.id, targetType, targetId, createdAt],
    );

    return {
      id,
      user_id: currentActor.id,
      target_type: targetType,
      target_id: targetId,
      created_at: createdAt,
    };
  }

  async deleteFavorite(actor: RequestActor | undefined, id: string) {
    const currentActor = this.actorOrDemo(actor);
    await this.pg.query(
      'DELETE FROM favorites WHERE id = $1 AND user_id = $2',
      [id, currentActor.id],
    );
    return { id, user_id: currentActor.id, deleted: true };
  }

  notificationPreferences(actor: RequestActor | undefined) {
    const currentActor = this.actorOrDemo(actor);
    return (
      this.notificationPreferencesStore.get(currentActor.id) ?? {
        sms: true,
        email: true,
        push: true,
        in_app: true,
      }
    );
  }

  updateNotificationPreferences(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const currentActor = this.actorOrDemo(actor);
    const preferences = {
      sms: Boolean(body.sms ?? true),
      email: Boolean(body.email ?? true),
      push: Boolean(body.push ?? true),
      in_app: Boolean(body.in_app ?? true),
    };
    this.notificationPreferencesStore.set(currentActor.id, preferences);
    return preferences;
  }

  async dataExport(actor: RequestActor | undefined) {
    const currentActor = this.actorOrDemo(actor);
    const job = {
      id: randomUUID(),
      owner_id: currentActor.id,
      type: 'personal-data',
      format: 'json',
      status: 'queued',
      created_at: new Date().toISOString(),
    };
    await this.jobs.add(
      'user-data-export',
      { export_id: job.id, user_id: currentActor.id },
      { idempotencyKey: `user-data-export:${currentActor.id}` },
    );
    return job;
  }

  async deleteRequest(actor: RequestActor | undefined) {
    const currentActor = this.actorOrDemo(actor);
    return {
      user_id: currentActor.id,
      status: 'requested',
      created_at: new Date().toISOString(),
    };
  }

  private async assertUser(id: string) {
    const [user] = await this.pg.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    if (!user) {
      throw new NotFoundException({
        code: 'USER_BLOCKED',
        message: 'User topilmadi',
      });
    }

    return user;
  }
}
