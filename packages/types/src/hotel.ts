export interface Hotel {
  id: string;
  name: string;
  city: string;
  /** Bir kechalik narx (so'm). */
  pricePerNight: number;
  /** O'rtacha reyting (0–5). */
  rating: number;
  /** Yulduzlar soni (1–5). */
  stars: number;
  description?: string;
  amenities?: string[];
  images?: string[];
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  available: number;
}

/** Mehmonxona qidiruv parametrlari. */
export interface HotelSearchQuery {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice?: number;
  maxPrice?: number;
  stars?: number;
}
