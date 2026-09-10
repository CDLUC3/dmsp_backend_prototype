import casual from "casual";
import { getCurrentDate, isNullOrUndefined } from "../../utils/helpers.js";
import { PaginationOptionsForOffsets, PaginationOptionsForCursors } from '../../types/general.js';

// A generic shape for entries stored in a mock table. Mocks store arbitrary
// model-like objects, all of which are expected to have a numeric id. Callers
// can supply a more specific type parameter (e.g. the real model's
// constructor options type) to get properly typed results back out.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockEntry = { id?: number; [key: string]: any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTableStores: Record<string, any[]> = {};

// Add a new mock table
export const addMockTableStore = <T extends MockEntry = MockEntry>(tableName: string, store: T[]): void => {
  mockTableStores[tableName] = store;
}

// Clear a mock table
export const clearMockTableStore = (tableName: string): void => {
  mockTableStores[tableName] = [];
}

// Get a mock table

export const getMockTableStore = <T extends MockEntry = MockEntry>(tableName: string): T[] => {
  return mockTableStores[tableName];
}

// Get a random entry from a mock table
export const getRandomEntryFromMockTable = <T extends MockEntry = MockEntry>(tableName: string): T | null => {
  const store: T[] = mockTableStores[tableName];
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

// Get the next logical id for an entry in a mock table
const getNextId = (store: MockEntry[]): number => {
  if (store.length === 0) {
    return 1;
  }
  const maxId = store.reduce((max, entry) => Math.max(max, entry.id ?? 0), 0);
  return maxId + 1;
}

// Add an entry to a mock table
export const addEntryToMockTable = <T extends MockEntry = MockEntry>(tableName: string, entry: T): { insertId: number } => {
  const store: T[] = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  const obj = {
    ...entry,

    // Always use our id
    id: getNextId(store),
    // Default the following properties if they are null/undefined
    createdById: entry.createdById ?? casual.integer(1, 999),
    created: entry.created ?? getCurrentDate(),
    modifiedById: entry.modifiedById ?? casual.integer(1, 999),
    modified: entry.modified ?? getCurrentDate(),
  };

  store.push(obj);
  return { insertId: obj.id };
}

// Update an entry in a mock table
export const updateEntryInMockTable = <T extends MockEntry = MockEntry>(tableName: string, entry: T): T | null => {
  const store: T[] = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  const index = store.findIndex((e) => e.id === entry.id);
  if (index === -1) {
    return null;
  }
  const obj = {
    modifiedById: casual.integer(1, 999),
    modified: getCurrentDate(),
    ...entry,
  }
  store[index] = obj;
  return store[index];
}

// Delete an entry from a mock table
export const deleteEntryFromMockTable = (tableName: string, id: number): boolean => {
  const store: MockEntry[] = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  const index = store.findIndex((e) => e.id === id);
  if (index === -1) {
    return false;
  }
  store.splice(index, 1);
  return true;
}

// Find an entry in a mock table by id
export const findEntryInMockTableById = <T extends MockEntry = MockEntry>(tableName: string, id: number): T | undefined => {
  const store: T[] = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  return store.find((entry) => entry.id === id);
}

// Find an entry in a mock table by the filter in the callback
export const findEntryInMockTableByFilter = <T extends MockEntry = MockEntry>(
  tableName: string,
  criteria: (entry: T) => boolean
): T | undefined => {
  const store: T[] = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  return store.find(criteria);
}

// Find all entries in a mock table that match a filter
export const findEntriesInMockTableByFilter = <T extends MockEntry = MockEntry>(
  tableName: string,
  criteria: (entry: T) => boolean
): T[] => {
  const store: T[] = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  return store.filter(criteria);
}

// Simulate pagination of the results returned from a query
export const paginate = <T extends MockEntry = MockEntry>(
  results: T[],
  paginationOptions: PaginationOptionsForCursors | PaginationOptionsForOffsets
) => {
  const totalCount = results.length;
  const finalId = results.length > 0 ? results[results.length - 1].id : null;

  const paginatedResults = ('offset' in paginationOptions && !isNullOrUndefined(paginationOptions.offset))
    ? paginateByOffset(results, paginationOptions as PaginationOptionsForOffsets)
    : paginateByCursor(results, paginationOptions as PaginationOptionsForCursors);

  const lastId = paginatedResults.length > 0 ? paginatedResults[paginatedResults.length - 1].id : null;
  const limit = paginationOptions.limit ?? results.length;

  let hasPreviousPage = false;
  if ('offset' in paginationOptions && !isNullOrUndefined(paginationOptions.offset)) {
    hasPreviousPage = totalCount > limit && paginationOptions.offset > 0;

  }

  return {
    totalCount,
    limit,
    currentOffset: ('offset' in paginationOptions) ? paginationOptions.offset : null,
    nextCursor: ('cursor' in paginationOptions) && finalId !== lastId ? lastId?.toString() : null,
    hasNextPage: paginatedResults.length === limit,
    hasPreviousPage,
    availableSortFields: [],
    items: paginatedResults,
  }
}

// Paginate the results by offset
const paginateByOffset = <T extends MockEntry>(results: T[], paginationOptions: PaginationOptionsForOffsets): T[] => {
  if (Array.isArray(results)) {
    const { offset = 0, limit = results.length } = paginationOptions;
    return results.slice(offset, offset + limit);
  }
  return [];
}

// Paginate the results by cursor
const paginateByCursor = <T extends MockEntry>(results: T[], paginationOptions: PaginationOptionsForCursors): T[] => {
  if (Array.isArray(results)) {
    const { cursor, limit = results.length } = paginationOptions;
    const index = results.findIndex((entry) => entry.id?.toString() === cursor);
    if (index === -1) {
      return results.slice(0, limit);
    }
    return results.slice(index + 1, index + 1 + limit);
  }
  return [];
}
