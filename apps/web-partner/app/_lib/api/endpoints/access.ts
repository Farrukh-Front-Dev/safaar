function adminBaseUrl() {
  if (process.env.NEXT_PUBLIC_ADMIN_URL) return process.env.NEXT_PUBLIC_ADMIN_URL;
  if (typeof window === "undefined") return "http://localhost:3002";

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3002`;
}

export type PartnerAccessStatus = "not_found" | "new" | "reviewing" | "approved" | "rejected";

export interface PartnerApplicationDraft {
  companyName: string;
  type: "hotel" | "bus";
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  taxId?: string;
  note?: string;
}

export async function submitPartnerApplication(body: PartnerApplicationDraft) {
  const response = await fetch(`${adminBaseUrl()}/api/partner-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Arizani yuborib bo'lmadi. Web-admin serverini tekshiring.");
  }

  return response.json() as Promise<{ item: { id: string; status: PartnerAccessStatus } }>;
}

export async function getPartnerAccessStatus(phone: string) {
  const url = new URL(`${adminBaseUrl()}/api/partner-requests`);
  url.searchParams.set("phone", phone);
  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Hamkor access holatini tekshirib bo'lmadi.");
  }

  return response.json() as Promise<{
    found: boolean;
    status: PartnerAccessStatus;
    request?: { id: string; companyName: string; status: PartnerAccessStatus } | null;
  }>;
}
