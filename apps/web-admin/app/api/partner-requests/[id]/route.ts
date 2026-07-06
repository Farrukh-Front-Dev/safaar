import { NextRequest, NextResponse } from "next/server";
import type { PartnerRequestStatus } from "@/types/admin";
import { setPartnerRequestStatus } from "@/lib/partner-requests-store";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...corsHeaders, ...(init?.headers ?? {}) },
  });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status ?? "") as PartnerRequestStatus;

  if (!["new", "reviewing", "approved", "rejected"].includes(status)) {
    return json({ message: "Noto'g'ri status" }, { status: 400 });
  }

  const item = setPartnerRequestStatus(id, status);
  if (!item) {
    return json({ message: "Ariza topilmadi" }, { status: 404 });
  }

  return json({ item });
}
