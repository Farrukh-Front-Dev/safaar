import { Injectable, NotFoundException } from '@nestjs/common';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: InMemoryDbService) {}

  create(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const review = {
      id: this.db.id('review'),
      user_id: currentActor.id,
      booking_id: String(body.booking_id ?? ''),
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

  update(id: string, body: Record<string, unknown>) {
    const review = this.assertReview(id);
    review['rating'] = Number(body.rating ?? review['rating']);
    review['body'] = String(body.body ?? review['body']);
    review['updated_at'] = this.db.now();
    return review;
  }

  delete(id: string) {
    const review = this.assertReview(id);
    review['status'] = 'hidden';
    review['hidden_at'] = this.db.now();
    return review;
  }

  reply(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    this.assertReview(id);
    const currentActor = this.db.actorOrDemo(actor);
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
}
