import { generalConfig } from "../config/generalConfig";
import { PaginatedQueryResult } from "../types/general";

// Paginate the results of a query
export const paginateResults = (
    results: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    cursor: string | number | null,
    cursorField: string,
    limit: number,
  ): PaginatedQueryResult => {
    // Return an empty array if the results are not an array or empty
    if (!Array.isArray(results) || results.length === 0) {
      return { items: [], nextCursor: null, error: null };
    }

    // Determine the maximum number of results to return
    const maxNbrResults = Math.min(
      (limit && limit >= 1) ? limit : generalConfig.defaultSearchLimit,
      generalConfig.maximumSearchLimit
    );

    // If a cursor was provided, return only the next set of results
    if (cursor && cursorField) {
      const startIndex = results.findIndex((entry) => entry[cursorField] === cursor);
      if (startIndex > -1) {
        const paginatedResults = results.slice(startIndex + 1, startIndex + 1 + maxNbrResults);
        const nextCursor = paginatedResults.length === maxNbrResults
          ? paginatedResults[paginatedResults.length - 1][cursorField]
          : null;
        return { items: paginatedResults, nextCursor, error: null };
      }
      // If the cursor was not found, return an error
      return { items: [], nextCursor: null, error: `Cursor ${cursor} not found` };
    }

    // If a cursor was provided but the cursorField is invalid, return an error
    if (cursor && !cursorField) {
      return { items: [], nextCursor: null, error: `Invalid cursor field: ${cursorField}` };
    }

    // No cursor provided, return the first N results
    const paginatedResults = results.slice(0, maxNbrResults);
    const nextCursor = paginatedResults.length === maxNbrResults
      ? paginatedResults[paginatedResults.length - 1][cursorField]
      : null;

    return { items: paginatedResults, nextCursor, error: null };
  }
