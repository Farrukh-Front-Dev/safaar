import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: InMemoryDbService) {}

  create(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const bookingId = String(body.booking_id ?? '');
    const booking = this.db.findBooking(bookingId);
    if (!booking || booking.user_id !== currentActor.id) {
      throw new ForbiddenException({
        code: 'REVIEW_BOOKING_FORBIDDEN',
        message: 'Faqat o‘z broningiz uchun sharh qoldirasiz',
      });
    }
    const review = {
      id: this.db.id('review'),
      user_id: currentActor.id,
      booking_id: bookingId,
      target_type: String(body.target_type ?? 'hotel'),
      target_id: String(body.target_id ?? body.hotel_id ?? ''),
      rating: Number(body.rating ?? 5),
      body: String(body.body ?? ''),
      status: 'published',
      created_at: this.db.now(),
      updated_at: this.db.now(),
    };
    this.db.reviews.unshift(review);
    return review;
  }

  update(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const review = this.assertReview(id);
    this.assertReviewOwner(actor, review);
    review['rating'] = Number(body.rating ?? review['rating']);
    review['body'] = String(body.body ?? review['body']);
    review['updated_at'] = this.db.now();
    return review;
  }

  delete(actor: RequestActor | undefined, id: string) {
    const review = this.assertReview(id);
    this.assertReviewOwner(actor, review);
    review['status'] = 'hidden';
    review['hidden_at'] = this.db.now();
    return review;
  }

  reply(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const currentActor = this.db.actorOrDemo(actor);
    const review = this.assertReview(id);
    this.assertPartnerCanReply(currentActor, review);
    const reply = {
      id: this.db.id('reply'),
      review_id: id,
      partner_user_id: currentActor.id,
      body: String(body.body ?? ''),
      created_at: this.db.now(),
    };
    return reply;
  }

  private assertReview(id: string) {
    const review = this.db.reviews.find((item) => item['id'] === id);
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
    const currentActor = this.db.actorOrDemo(actor);
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

  private assertPartnerCanReply(
    actor: RequestActor,
    review: Record<string, unknown>,
  ) {
    const booking = this.db.findBooking(String(review['booking_id'] ?? ''));
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
