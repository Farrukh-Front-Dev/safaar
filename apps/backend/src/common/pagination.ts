export type PaginationScope = 'public' | 'partner' | 'admin';
export type SortOrder = 'asc' | 'desc';

export interface PaginationOptions {
  defaultLimit?: number;
  defaultSortBy?: string;
  allowedSortBy?: readonly string[];
}

export interface PaginationQuery {
  page: number;
  limit: number;
  offset: number;
  sortBy: string;
  order: SortOrder;
}

export type QueryLike = Record<string, string | string[] | undefined>;

const MAX_LIMITS: Record<PaginationScope, number> = {
  public: 50,
  partner: 100,
  admin: 100,
};

export function parsePagination(
  query: QueryLike = {},
  scope: PaginationScope,
  options: PaginationOptions = {},
): PaginationQuery {
  const maxLimit = MAX_LIMITS[scope];
  const page = Math.max(1, toPositiveInt(first(query.page), 1));
  const requestedLimit = toPositiveInt(
    first(query.limit),
    Math.min(options.defaultLimit ?? 20, maxLimit),
  );
  const limit = Math.min(requestedLimit, maxLimit);
  const allowedSortBy = options.allowedSortBy ?? [];
  const requestedSortBy = first(query.sort_by) ?? first(query.sortBy);
  const sortBy =
    requestedSortBy && allowedSortBy.includes(requestedSortBy)
      ? requestedSortBy
      : (options.defaultSortBy ?? allowedSortBy[0] ?? 'created_at');
  const requestedOrder = String(first(query.order) ?? '').toLowerCase();
  const order: SortOrder = requestedOrder === 'asc' ? 'asc' : 'desc';

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    sortBy,
    order,
  };
}

export function paginateArray<T>(
  items: readonly T[],
  pagination: PaginationQuery,
  accessors: Partial<Record<string, (item: T) => unknown>> = {},
): T[] {
  const accessor = accessors[pagination.sortBy];
  const sorted = accessor
    ? [...items].sort((left, right) =>
        compareValues(accessor(left), accessor(right), pagination.order),
      )
    : [...items];

  return sorted.slice(pagination.offset, pagination.offset + pagination.limit);
}

export function paginatedObject<T>(
  items: readonly T[],
  pagination: PaginationQuery,
): {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
} {
  return {
    items: items.slice(pagination.offset, pagination.offset + pagination.limit),
    total: items.length,
    page: pagination.page,
    limit: pagination.limit,
    total_pages: Math.max(1, Math.ceil(items.length / pagination.limit)),
  };
}

export function limitOffsetSql(pagination: PaginationQuery): string {
  return `limit ${pagination.limit} offset ${pagination.offset}`;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function compareValues(
  left: unknown,
  right: unknown,
  order: SortOrder,
): number {
  const direction = order === 'asc' ? 1 : -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * direction;
  }

  const leftTime = Date.parse(String(left ?? ''));
  const rightTime = Date.parse(String(right ?? ''));
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
    return (leftTime - rightTime) * direction;
  }

  return String(left ?? '').localeCompare(String(right ?? '')) * direction;
}
