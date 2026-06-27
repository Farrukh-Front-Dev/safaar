export enum BookingStatus {
  PENDING = "PENDING",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  AWAITING_PARTNER_CONFIRMATION = "AWAITING_PARTNER_CONFIRMATION",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
}

export enum BookingType {
  HOTEL = "HOTEL",
  BUS = "BUS",
}

export enum PaymentMethod {
  CLICK = "CLICK",
  PAYME = "PAYME",
  UZCARD = "UZCARD",
  HUMO = "HUMO",
  CASH = "CASH",
}

export enum ConfirmationMode {
  INSTANT_CONFIRMATION = "INSTANT_CONFIRMATION",
  REQUEST_CONFIRMATION = "REQUEST_CONFIRMATION",
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  bookingNumber?: string;
  type?: BookingType;
  paymentMethod?: PaymentMethod;
  confirmationMode?: ConfirmationMode;
  currency?: "UZS";
  commissionAmount?: number;
  partnerPayable?: number;
}

export interface CreateBookingDto {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}
