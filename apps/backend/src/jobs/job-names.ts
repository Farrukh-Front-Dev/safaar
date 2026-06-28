export const QUEUES = {
  SMS: 'sms',
  EMAIL: 'email',
  PUSH: 'push',
  EXPORTS: 'exports',
  PAYMENTS: 'payments',
  WEBHOOKS: 'webhooks',
  BOOKINGS: 'bookings',
} as const;

export const JOBS = {
  SEND_SMS: 'send-sms',
  SEND_EMAIL: 'send-email',
  SEND_PUSH: 'send-push',
  EXPIRE_BOOKING_HOLDS: 'expire-booking-holds',
  EXPORT_REPORT: 'export-report',
  RECONCILE_PAYMENT: 'reconcile-payment',
  DELIVER_PARTNER_WEBHOOK: 'deliver-partner-webhook',
} as const;
