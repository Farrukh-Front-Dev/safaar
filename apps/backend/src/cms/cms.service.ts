import { Injectable } from '@nestjs/common';
import { AppCacheService } from '../infrastructure/cache.service';

@Injectable()
export class CmsService {
  constructor(private readonly cache: AppCacheService) {}

  private readonly data: Record<string, Array<Record<string, unknown>>> = {
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
    offers: [],
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

  collection(name: string) {
    return this.cache.getOrSet(`cms:collection:${name}`, 300, () => {
      return this.data[name] ?? [];
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
