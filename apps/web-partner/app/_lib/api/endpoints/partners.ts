import { request } from "../client";

export interface PartnerDashboard {
  todayBookings: number;
  monthRevenue: number;
  totalCustomers: number;
  rating: number;
}

/** Hamkor bosh paneli ko'rsatkichlari (`GET /api/partners/dashboard`). */
export function getDashboard(token: string | null): Promise<PartnerDashboard> {
  return request<PartnerDashboard>("/partners/dashboard", { token });
}
