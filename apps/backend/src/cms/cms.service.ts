import { Injectable } from '@nestjs/common';

@Injectable()
export class CmsService {
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
    return this.data[name] ?? [];
  }

  one(name: string, slug: string) {
    return (
      this.collection(name).find((item) => item['slug'] === slug) ?? {
        slug,
        status: 'draft',
      }
    );
  }

  publicSettings() {
    return {
      support_phone: '+998 71 200 00 00',
      support_email: 'support@uzbron.uz',
      languages: ['uz', 'ru', 'en'],
      currency: 'UZS',
      social_links: {
        telegram: 'https://t.me/uzbron',
      },
    };
  }
}
