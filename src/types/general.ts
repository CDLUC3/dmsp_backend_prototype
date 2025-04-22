// The results of a query that supports pagination.
export interface PaginatedQueryResult {
  items: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
  nextCursor: string | number | null,
  error: string | null
}
