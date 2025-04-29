import { generalConfig } from "../config/generalConfig";
import { PaginatedQueryResult, PaginationOptions } from "../types/general";
import { isNullOrUndefined } from "../utils/helpers";

export const processPaginationOptions = (options: PaginationOptions | undefined) => {
  if (!options) {
    return {
      limit: generalConfig.defaultSearchLimit,
      offset: 0,
      cursor: undefined,
    };
  }

  // Validate limit and set to default if invalid
  const limit = options.limit && options.limit >= 1 && options.limit < generalConfig.maximumSearchLimit
    ? options.limit
    : generalConfig.defaultSearchLimit;

  // Validate offset and cursor and set to default if invalid
  const offset = options.offset && options.offset >= 0 ? options.offset : 0;
  const cursor = options.cursor ?? undefined;

  return {
    limit,
    offset,
    cursor,
  }
}

export const processPaginatedResults = <T>(result: PaginatedQueryResult<T>) => {
  const hasNextPage = !isNullOrUndefined(result.nextCursor)
    || result.totalCount <= result.currentOffset + result.limit;

    const hasPreviousPage = !isNullOrUndefined(result.nextCursor) > 0;

  return {
    hasNextPage,
    hasPreviousPage,
  } as
}
