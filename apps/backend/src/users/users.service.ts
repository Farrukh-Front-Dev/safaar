import { Injectable, NotFoundException } from '@nestjs/common';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class UsersService {
  private readonly favoritesStore: Array<Record<string, unknown>> = [];
  private readonly notificationPreferencesStore = new Map<
    string,
    Record<string, boolean>
  >();

  constructor(private readonly db: InMemoryDbService) {}

  profile(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return this.assertUser(currentActor.id);
  }

  updateProfile(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const user = this.profile(actor);
    user.first_name = body.first_name
      ? String(body.first_name)
      : user.first_name;
    user.last_name = body.last_name ? String(body.last_name) : user.last_name;
    user.email = body.email ? String(body.email).toLowerCase() : user.email;
    user.updated_at = this.db.now();
    return user;
  }

  setAvatar(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const user = this.profile(actor);
    return {
      user_id: user.id,
      avatar_media_id: String(body.media_id ?? this.db.id('media')),
      uploaded: true,
    };
  }

  deleteAvatar(actor: RequestActor | undefined) {
    const user = this.profile(actor);
    return { user_id: user.id, deleted: true };
  }

  bookings(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return this.db.bookings.filter(
      (booking) => booking.user_id === currentActor.id,
    );
  }

  booking(id: string) {
    const booking = this.db.findBooking(id);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }

    return booking;
  }

  bonuses(actor: RequestActor | undefined) {
    const user = this.profile(actor);
    return {
      balance: user.bonus_balance,
      currency: 'UZS',
      ledger: [],
    };
  }

  favorites(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return this.favoritesStore.filter(
      (favorite) => favorite['user_id'] === currentActor.id,
    );
  }

  addFavorite(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const favorite = {
      id: this.db.id('fav'),
      user_id: currentActor.id,
      target_type: String(body.target_type ?? 'hotel'),
      target_id: String(body.target_id ?? body.hotel_id ?? ''),
      created_at: this.db.now(),
    };
    this.favoritesStore.unshift(favorite);
    return favorite;
  }

  deleteFavorite(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    return {
      id,
      user_id: currentActor.id,
      deleted: true,
    };
  }

  notificationPreferences(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
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
    const currentActor = this.db.actorOrDemo(actor);
    const preferences = {
      sms: Boolean(body.sms ?? true),
      email: Boolean(body.email ?? true),
      push: Boolean(body.push ?? true),
      in_app: Boolean(body.in_app ?? true),
    };
    this.notificationPreferencesStore.set(currentActor.id, preferences);
    return preferences;
  }

  dataExport(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    const job = {
      id: this.db.id('export'),
      owner_id: currentActor.id,
      type: 'personal-data',
      format: 'json',
      status: 'queued',
      created_at: this.db.now(),
    };
    return job;
  }

  deleteRequest(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return {
      user_id: currentActor.id,
      status: 'requested',
      created_at: this.db.now(),
    };
  }

  private assertUser(id: string) {
    const user = this.db.findUser(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_BLOCKED',
        message: 'User topilmadi',
      });
    }

    return user;
  }
}
