"use client";

import { create } from "zustand";
import {
  mockPartners,
  mockPartnerRequests,
} from "./mock-data";
import type { Partner, PartnerRequest } from "@/types/admin";

interface AdminState {
  partners: Partner[];
  partnerRequests: PartnerRequest[];

  // Partner Mutations
  setPartners: (partners: Partner[]) => void;
  setPartnerRequests: (requests: PartnerRequest[]) => void;
  updatePartnerStatus: (id: string, status: Partner["status"]) => void;
  approvePartnerRequest: (id: string) => void;
  rejectPartnerRequest: (id: string, reason?: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  partners: mockPartners,
  partnerRequests: mockPartnerRequests,

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
}));
