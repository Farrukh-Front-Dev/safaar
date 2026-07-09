import { Injectable } from '@nestjs/common';
import { AppCacheService } from '../infrastructure/cache.service';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class CmsService {
  constructor(
    private readonly cache: AppCacheService,
    private readonly postgres: PostgresService,
  ) {}

  private readonly hardcoded: Record<string, Array<Record<string, unknown>>> = {
    banners: [
      {
        id: 'banner-home',
        title: {
          uz: 'UzBron bilan sayohat qiling',
          ru: 'Путешествуйте с UzBron',
          en: 'Travel with UzBron',
        },
        image_url: '/banners/home.jpg',
        status: 'published',
      },
    ],
    offers: [
      {
        id: 'deal-1',
        hotel_id: 'hotel-samarkand-plaza',
        slug: 'samarkand-plaza',
        name: {
          uz: 'Samarkand Plaza',
          ru: 'Samarkand Plaza',
          en: 'Samarkand Plaza',
        },
        city_name: { uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' },
        image_url: '/Samarkand-Registan-cinematic.jpeg',
        old_price: 45000000,
        new_price: 31500000,
        discount_percent: 30,
        ends_at: '2026-07-20T23:59:59Z',
        status: 'active',
      },
      {
        id: 'deal-2',
        hotel_id: 'hotel-grand-bukhara',
        slug: 'grand-bukhara',
        name: {
          uz: 'Grand Bukhara Hotel',
          ru: 'Grand Bukhara Hotel',
          en: 'Grand Bukhara Hotel',
        },
        city_name: { uz: 'Buxoro', ru: 'Бухара', en: 'Bukhara' },
        image_url: '/Bukhara-old-city-golden-hour.jpeg',
        old_price: 38000000,
        new_price: 28500000,
        discount_percent: 25,
        ends_at: '2026-07-22T23:59:59Z',
        status: 'active',
      },
      {
        id: 'deal-3',
        hotel_id: 'hotel-tashkent-palace',
        slug: 'tashkent-palace',
        name: {
          uz: 'Tashkent City Palace',
          ru: 'Tashkent City Palace',
          en: 'Tashkent City Palace',
        },
        city_name: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
        image_url: '/Tashkent-city-skyline.jpeg',
        old_price: 65000000,
        new_price: 52000000,
        discount_percent: 20,
        ends_at: '2026-07-25T23:59:59Z',
        status: 'active',
      },
    ],
    news: [],
    pages: [],
    faqs: [
      {
        id: 'faq-payment',
        question: {
          uz: 'Qanday to‘lov qilaman?',
          ru: 'Как оплатить?',
          en: 'How do I pay?',
        },
        answer: {
          uz: 'Click, Payme, Uzcard yoki Humo orqali.',
          ru: 'Через Click, Payme, Uzcard или Humo.',
          en: 'Via Click, Payme, Uzcard or Humo.',
        },
      },
    ],
  };

  async collection(name: string) {
    if (name === 'offers') {
      return this.offers();
    }
    return this.cache.getOrSet(`cms:collection:${name}`, 300, () => {
      return this.hardcoded[name] ?? [];
    });
  }

  async one(name: string, slug: string) {
    const collection = await this.collection(name);
    return (
      collection.find((item) => item['slug'] === slug) ?? {
        slug,
        status: 'draft',
      }
    );
  }

  async offers() {
    return this.cache.getOrSet('cms:collection:offers', 300, async () => {
      try {
        const rows = await this.postgres.query(`
          SELECT id::text, slug, title, body, metadata,
            published_at, status::text
          FROM cms_entries
          WHERE type = 'offer' AND status = 'published'
          ORDER BY published_at DESC
        `);

        if (rows.length > 0) {
          return rows.map((r: Record<string, unknown>) => {
            const meta = (r.metadata as Record<string, unknown>) || {};
            return {
              id: r.id,
              hotel_id: meta.hotel_id ?? '',
              slug: r.slug,
              name: r.title,
              city_name: meta.city_name ?? { uz: '', ru: '', en: '' },
              image_url: meta.image_url ?? '',
              old_price: meta.old_price ?? 0,
              new_price: meta.new_price ?? 0,
              discount_percent: meta.discount_percent ?? 0,
              ends_at: meta.ends_at ?? '',
              status: r.status ?? 'active',
            };
          });
        }
      } catch {
        // DB not ready, fall through to hardcoded
      }

      return this.hardcoded['offers'] ?? [];
    });
  }

  publicSettings() {
    return this.cache.getOrSet('settings:public', 900, () => {
      return {
        support_phone: '+998 71 200 00 00',
        support_email: 'support@uzbron.uz',
        languages: ['uz', 'ru', 'en'],
        currency: 'UZS',
        social_links: {
          telegram: 'https://t.me/uzbron',
        },
      };
    });
  }
}
