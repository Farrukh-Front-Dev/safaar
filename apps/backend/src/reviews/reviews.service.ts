import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly pg: PostgresService) {}

  async create(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    const bookingId = String(body.booking_id ?? '');
    const [booking] = await this.pg.query<{ id: string; user_id: string }>(
      'SELECT id, user_id FROM bookings WHERE id = $1',
      [bookingId],
    );
    if (!booking || booking.user_id !== currentActor.id) {
      throw new ForbiddenException({
        code: 'REVIEW_BOOKING_FORBIDDEN',
        message: 'Faqat o\u2018z broningiz uchun sharh qoldirasiz',
      });
    }
    const id = randomUUID();
    const now = new Date().toISOString();
    const targetType = String(body.target_type ?? 'hotel');
    const targetId = String(body.target_id ?? body.hotel_id ?? '');
    const rating = Number(body.rating ?? 5);
    const reviewBody = String(body.body ?? '');
    await this.pg.query(
      `INSERT INTO reviews (id, user_id, booking_id, target_type, target_id, rating, body, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        currentActor.id,
        bookingId,
        targetType,
        targetId,
        rating,
        reviewBody,
        'published',
        now,
        now,
      ],
    );
    return {
      id,
      user_id: currentActor.id,
      booking_id: bookingId,
      target_type: targetType,
      target_id: targetId,
      rating,
      body: reviewBody,
      status: 'published',
      created_at: now,
      updated_at: now,
    };
  }

  async update(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const review = await this.assertReview(id);
    this.assertReviewOwner(actor, review);
    const now = new Date().toISOString();
    const rating = Number(body.rating ?? review['rating']);
    const reviewBody = String(body.body ?? review['body']);
    await this.pg.query(
      'UPDATE reviews SET rating = $1, body = $2, updated_at = $3 WHERE id = $4',
      [rating, reviewBody, now, id],
    );
    return { ...review, rating, body: reviewBody, updated_at: now };
  }

  async delete(actor: RequestActor | undefined, id: string) {
    const review = await this.assertReview(id);
    this.assertReviewOwner(actor, review);
    const now = new Date().toISOString();
    await this.pg.query(
      'UPDATE reviews SET status = $1, updated_at = $2 WHERE id = $3',
      ['hidden', now, id],
    );
    return { ...review, status: 'hidden', updated_at: now };
  }

  async reply(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    const review = await this.assertReview(id);
    await this.assertPartnerCanReply(currentActor, review);
    const reply = {
      id: randomUUID(),
      review_id: id,
      partner_user_id: currentActor.id,
      body: String(body.body ?? ''),
      created_at: new Date().toISOString(),
    };
    return reply;
  }

  private async assertReview(id: string) {
    const [review] = await this.pg.query(
      'SELECT * FROM reviews WHERE id = $1',
      [id],
    );
    if (!review) {
      throw new NotFoundException({
        code: 'VALIDATION_ERROR',
        message: 'Sharh topilmadi',
      });
    }
    return review;
  }

  private assertReviewOwner(
    actor: RequestActor | undefined,
    review: Record<string, unknown>,
  ) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    if (
      currentActor.role === Role.SUPER_ADMIN ||
      currentActor.actorType === 'admin' ||
      review['user_id'] === currentActor.id
    ) {
      return;
    }
    throw new ForbiddenException({
      code: 'REVIEW_FORBIDDEN',
      message: 'Bu sharh sizga tegishli emas',
    });
  }

  private async assertPartnerCanReply(
    actor: RequestActor,
    review: Record<string, unknown>,
  ) {
    const [booking] = await this.pg.query<{
      partner_organization_id: string;
    }>('SELECT partner_organization_id FROM bookings WHERE id = $1', [
      String(review['booking_id'] ?? ''),
    ]);
    if (
      booking &&
      actor.actorType === 'partner' &&
      booking.partner_organization_id === actor.organizationId
    ) {
      return;
    }
    throw new ForbiddenException({
      code: 'REVIEW_REPLY_FORBIDDEN',
      message: 'Bu sharh sizning tashkilotingizga tegishli emas',
    });
  }
}
