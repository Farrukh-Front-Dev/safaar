"use client";

import { create } from "zustand";
import {
  mockPartners,
  mockPartnerRequests,
  mockUsers,
  mockHotelBookings,
  mockBusBookings,
  mockCmsBanners,
  mockListings,
} from "./mock-data";
import type { 
  Partner, 
  PartnerRequest, 
  AdminManagedUser, 
  AdminHotelBooking, 
  AdminBusBooking,
  CmsBanner,
  AdminListing,
} from "@/types/admin";
import type { BookingStatus } from "@agoda/types";

interface AdminState {
  partners: Partner[];
  partnerRequests: PartnerRequest[];
  users: AdminManagedUser[];
  hotelBookings: AdminHotelBooking[];
  busBookings: AdminBusBooking[];
  cmsBanners: CmsBanner[];
  listings: AdminListing[];

  // Partner Mutations
  setPartners: (partners: Partner[]) => void;
  setPartnerRequests: (requests: PartnerRequest[]) => void;
  updatePartnerStatus: (id: string, status: Partner["status"]) => void;
  approvePartnerRequest: (id: string) => void;
  rejectPartnerRequest: (id: string, reason?: string) => void;

  // User Mutations
  setUsers: (users: AdminManagedUser[]) => void;
  updateUserStatus: (id: string, status: AdminManagedUser["status"]) => void;

  // Booking Mutations
  setHotelBookings: (bookings: AdminHotelBooking[]) => void;
  updateHotelBookingStatus: (id: string, status: BookingStatus) => void;
  setBusBookings: (bookings: AdminBusBooking[]) => void;
  updateBusBookingStatus: (id: string, status: BookingStatus) => void;

  // CMS Banners Mutations
  addBanner: (banner: Omit<CmsBanner, "id">) => void;
  updateBanner: (id: string, banner: Partial<CmsBanner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerStatus: (id: string) => void;

  // Listing Mutations
  approveListing: (id: string) => void;
  rejectListing: (id: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  partners: mockPartners,
  partnerRequests: mockPartnerRequests,
  users: mockUsers,
  hotelBookings: mockHotelBookings,
  busBookings: mockBusBookings,
  cmsBanners: mockCmsBanners,
  listings: mockListings,

  setPartners: (partners) => set({ partners }),
  setPartnerRequests: (partnerRequests) => set({ partnerRequests }),

  updatePartnerStatus: (id, status) =>
    set((state) => ({
      partners: state.partners.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    })),

  approvePartnerRequest: (id) =>
    set((state) => {
      const request = state.partnerRequests.find((r) => r.id === id);
      if (!request) return state;

      const newPartner: Partner = {
        id: `P-${Date.now()}`,
        companyName: request.companyName,
        type: request.type,
        contactPerson: request.contactPerson,
        phone: request.phone,
        email: request.email,
        city: request.city,
        address: request.address,
        commissionPercent: request.type === "hotel" ? 15 : 10,
        rating: 0,
        totalBookings: 0,
        totalRevenue: 0,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      return {
        partnerRequests: state.partnerRequests.map((r) =>
          r.id === id ? { ...r, status: "approved" } : r
        ),
        partners: [newPartner, ...state.partners],
      };
    }),

  rejectPartnerRequest: (id, reason) =>
    set((state) => ({
      partnerRequests: state.partnerRequests.map((r) =>
        r.id === id ? { ...r, status: "rejected", reason } : r
      ),
    })),

  // Listings
  approveListing: (id) => 
    set((state) => ({
      listings: state.listings.map((l) => 
        l.id === id ? { ...l, status: "published" } : l
      ),
    })),
  rejectListing: (id) => 
    set((state) => ({
      listings: state.listings.map((l) => 
        l.id === id ? { ...l, status: "rejected" } : l
      ),
    })),

  // Users
  setUsers: (users) => set({ users }),
  updateUserStatus: (id, status) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, status } : u
      ),
    })),

  // Bookings
  setHotelBookings: (hotelBookings) => set({ hotelBookings }),
  updateHotelBookingStatus: (id, status) =>
    set((state) => ({
      hotelBookings: state.hotelBookings.map((b) =>
        b.id === id ? { ...b, status } : b
      ),
    })),
    
  setBusBookings: (busBookings) => set({ busBookings }),
  updateBusBookingStatus: (id, status) =>
    set((state) => ({
      busBookings: state.busBookings.map((b) =>
        b.id === id ? { ...b, status } : b
      ),
    })),
    
  // CMS Banners
  addBanner: (banner) =>
    set((state) => {
      const newBanner = { ...banner, id: `BN-${Date.now()}` };
      return { cmsBanners: [...state.cmsBanners, newBanner].sort((a, b) => a.order - b.order) };
    }),
  updateBanner: (id, banner) =>
    set((state) => ({
      cmsBanners: state.cmsBanners.map((b) =>
        b.id === id ? { ...b, ...banner } : b
      ).sort((a, b) => a.order - b.order),
    })),
  deleteBanner: (id) =>
    set((state) => ({
      cmsBanners: state.cmsBanners.filter((b) => b.id !== id),
    })),
  toggleBannerStatus: (id) =>
    set((state) => ({
      cmsBanners: state.cmsBanners.map((b) =>
        b.id === id ? { ...b, isActive: !b.isActive } : b
      ),
    })),
}));
