import { authService } from "./services/auth";
import { bookingsService } from "./services/bookings";
import { catalogService } from "./services/catalog";
import { cmsService } from "./services/cms";
import { hotelsService } from "./services/hotels";
import { reviewsService } from "./services/reviews";
import { usersService } from "./services/users";

export const api = {
  auth: authService,
  bookings: bookingsService,
  catalog: catalogService,
  cms: cmsService,
  hotels: hotelsService,
  reviews: reviewsService,
  users: usersService,
};

export { apiConfig, ApiRequestError } from "./client";
export * from "./types";
export * from "./adapters";
export { formatSum, formatTiyin, tiyinToSum } from "./money";

export * from "./services/auth";
export * from "./services/bookings";
export * from "./services/catalog";
export * from "./services/cms";
export * from "./services/hotels";
export * from "./services/reviews";
export * from "./services/users";
