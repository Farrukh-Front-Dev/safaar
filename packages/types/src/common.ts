/** Standart sahifalangan API javobi. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Standart xato javobi. */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
