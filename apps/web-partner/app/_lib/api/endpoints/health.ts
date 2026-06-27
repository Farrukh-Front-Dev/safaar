import { request } from "../client";

export interface HealthResponse {
  status: string;
  service: string;
}

/** Backend ulanish holatini tekshirish (`GET /api/health`). */
export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}
