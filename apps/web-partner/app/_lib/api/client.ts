import type { ApiError } from "@safaar/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api/backend";

interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: {
    request_id?: string;
  };
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: ApiError,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  role?: "PARTNER" | "ADMIN" | "SUPER_ADMIN";
  organizationId?: string;
  /** Skelet bosqichida headerlarni keng moslash uchun. */
  searchParams?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(
  path: string,
  searchParams?: RequestOptions["searchParams"],
): string {
  const url = new URL(
    path.startsWith("http") ? path : `${API_BASE_URL}${path}`,
  );
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Backend uchun universal HTTP wrapper.
 *
 * - JSON serialization/deserialization avtomatik
 * - `Authorization: Bearer <token>` qo'yiladi (token mavjud bo'lsa)
 * - Xato bo'lsa `HttpError` tashlaydi (status, payload bilan)
 *
 * @example
 *   const data = await request<Hotel[]>("/hotels");
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let defaultOrgId = "demo-partner-org-id";
  if (typeof window !== "undefined") {
    try {
      const auth = JSON.parse(localStorage.getItem("uzbron-partner-auth") || "{}");
      if (auth?.state?.user?.organizationId) {
        defaultOrgId = auth.state.user.organizationId;
      }
    } catch {}
  }

  const {
    body,
    token,
    role = "PARTNER",
    organizationId = defaultOrgId,
    searchParams,
    headers,
    ...rest
  } = options;

  const init: RequestInit = {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "x-user-role": role,
      "x-organization-id": organizationId,
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  let response: Response;
  try {
    response = await fetch(buildUrl(path, searchParams), init);
  } catch (cause) {
    // fetch'ning o'zi otgan xato: tarmoq yo'q, CORS, backend offline va h.k.
    throw new HttpError(
      0,
      "Backend bilan bog'lana olmadi. Internet va server holatini tekshiring.",
      { statusCode: 0, message: cause instanceof Error ? cause.message : "Network error" },
    );
  }

  if (!response.ok) {
    let payload: {
      error?: { message?: string; fields?: ApiError["fields"]; code?: string };
      message?: string;
      fields?: ApiError["fields"];
      code?: string;
    } | undefined;
    try {
      payload = await response.json();
    } catch {
      // ignore
    }

    const apiError: ApiError = {
      message: payload?.error?.message ?? payload?.message ?? response.statusText,
      fields: payload?.error?.fields ?? payload?.fields,
      code: payload?.error?.code ?? payload?.code,
      statusCode: response.status,
    };

    throw new HttpError(
      response.status,
      apiError.message,
      apiError,
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as T | ApiEnvelope<T>;
  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}
