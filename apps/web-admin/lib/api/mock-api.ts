import { mockUsers, mockPartners, mockHotelBookings } from "../mock-data";
import { AdminManagedUser, Partner, AdminHotelBooking } from "../../types/admin";

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const MockApi = {
  // Auth
  login: async (username: string, password: string) => {
    await delay();
    if (username === "admin" && password === "admin123") {
      return {
        token: "mock_jwt_token_1234567890",
        user: {
          id: "1",
          name: "Super Admin",
          email: "admin@uzbron.uz",
          role: "SUPER_ADMIN" as const,
        },
      };
    }
    throw new Error("Invalid credentials");
  },

  // Users
  getUsers: async (): Promise<AdminManagedUser[]> => {
    await delay(600);
    return mockUsers as AdminManagedUser[];
  },

  // Partners
  getPartners: async (): Promise<Partner[]> => {
    await delay(600);
    return mockPartners as Partner[];
  },

  // Bookings
  getBookings: async (): Promise<AdminHotelBooking[]> => {
    await delay(600);
    return mockHotelBookings as AdminHotelBooking[];
  },

  // Generic stats
  getDashboardStats: async () => {
    await delay(400);
    return {
      totalUsers: mockUsers.length,
      totalPartners: mockPartners.length,
      totalBookings: mockHotelBookings.length,
      revenue: 15400000,
    };
  },
};
