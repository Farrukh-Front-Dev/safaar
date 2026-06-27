export const SERVER_EVENTS = {
  NOTIFICATION_CREATED: 'notification.created',
  BOOKING_STATUS_CHANGED: 'booking.status_changed',
  PAYMENT_STATUS_CHANGED: 'payment.status_changed',
  SUPPORT_MESSAGE_CREATED: 'support.message_created',
  SUPPORT_TICKET_UPDATED: 'support.ticket_updated',
  BOOKING_MESSAGE_CREATED: 'booking.message_created',
  BOOKING_MESSAGE_READ: 'booking.message_read',
  PARTNER_DASHBOARD_UPDATED: 'partner.dashboard_updated',
  ADMIN_DASHBOARD_UPDATED: 'admin.dashboard_updated',
} as const;

export const CLIENT_EVENTS = {
  ROOM_JOIN: 'room.join',
  ROOM_LEAVE: 'room.leave',
  NOTIFICATION_READ: 'notification.read',
} as const;
