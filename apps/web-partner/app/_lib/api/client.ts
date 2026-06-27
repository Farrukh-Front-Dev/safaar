import type { ApiError } from "@agoda/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

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
  const { body, token, searchParams, headers, ...rest } = options;

  const init: RequestInit = {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    let payload: ApiError | undefined;
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      // ignore
    }
    throw new HttpError(
      response.status,
      payload?.message ?? response.statusText,
      payload,
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
