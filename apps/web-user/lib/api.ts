import type { ApiError, ApiResponse } from "@agoda/types";

/**
 * Backend API base URL.
 *
 * Backend global prefix `v1` ishlatadi (backend `main.ts` → `API_PREFIX=v1`),
 * shuning uchun default `http://localhost:4000/v1`. Production'da
 * `NEXT_PUBLIC_API_URL` env orqali boshqariladi.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

/**
 * Backend qaytaradigan xato (`ApiError`) uchun typed Error.
 * UI shu `message`/`code`/`fields` orqali foydalanuvchiga aniq xabar ko'rsatadi.
 */
export class ApiRequestError extends Error {
  readonly statusCode?: number;
  readonly code?: string;
  readonly fields?: unknown;
  readonly requestId?: string;

  constructor(error: ApiError, fallbackStatus?: number) {
    super(error.message || "So'rov bajarilmadi");
    this.name = "ApiRequestError";
    this.statusCode = error.statusCode ?? fallbackStatus;
    this.code = error.code;
    this.fields = error.fields;
    this.requestId = error.meta?.request_id;
  }
}

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON body — avtomatik `JSON.stringify` qilinadi. */
  body?: unknown;
  /** Bearer token (auth talab qiladigan endpointlar uchun). */
  token?: string;
  /** URL query parametrlari (undefined/null'lar tashlab yuboriladi). */
  query?: Record<string, QueryValue>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  const url = new URL(path.replace(/^\//, ""), base);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function isApiError(payload: unknown): payload is ApiError {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    (payload as { success?: unknown }).success === false
  );
}

/**
 * Markaziy fetch wrapper.
 *
 * - URL'ni base + path + query'dan quradi.
 * - JSON body va `Authorization` header'ni o'rnatadi.
 * - Backend "envelope"sini (`ApiResponse<T>`) ochib, faqat `data` ni qaytaradi.
 * - Xato bo'lsa `ApiRequestError` tashlaydi.
 *
 * Server va client komponentlarda ham ishlaydi (isomorphic).
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, query, headers, ...init } = options;

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content — qaytaradigan tana yo'q.
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || payload === null || isApiError(payload)) {
    const error: ApiError = isApiError(payload)
      ? payload
      : { success: false, message: response.statusText || "Server xatosi" };
    throw new ApiRequestError(error, response.status);
  }

  // Muvaffaqiyatli javob — `ApiSuccess<T>`.
  if ("data" in payload) {
    return payload.data;
  }

  // Backend ba'zan envelope'siz qaytarishi mumkin — xavfsiz fallback.
  return payload as unknown as T;
}

/** Qulay HTTP metod yorliqlari. */
export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
