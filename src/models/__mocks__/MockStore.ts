import casual from "casual";
import { getCurrentDate } from "../../utils/helpers";

const mockTableStores = {};

// Add a new mock table
export const addMockTableStore = (tableName, store): void => {
  mockTableStores[tableName] = store;
}

// Clear a mock table
export const clearMockTableStore = (tableName): void => {
  mockTableStores[tableName] = [];
}

// Get a mock table

export const getMockTableStore = (tableName) => {
  return mockTableStores[tableName];
}

// Get a random entry from a mock table
export const getRandomEntryFromMockTable = (tableName) => {
  const store = mockTableStores[tableName];
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

// Get the next logical id for an entry in a mock table
const getNextId = (store): number => {
  if (store.length === 0) {
    return 1;
  }
  const maxId = store.reduce((max, entry) => Math.max(max, entry.id), 0);
  return maxId + 1;
}

// Add an entry to a mock table
export const addEntryToMockTable = (tableName, entry): { insertId: number } => {
  const store = mockTableStores[tableName];
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
export const updateEntryInMockTable = (tableName, entry) => {
  const store = mockTableStores[tableName];
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
export const deleteEntryFromMockTable = (tableName, id): boolean => {
  const store = mockTableStores[tableName];
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
export const findEntryInMockTableById = (tableName, id) => {
  const store = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  return store.find((entry) => entry.id === id);
}

// Find an entry in a mock table by the filter in the callback
export const findEntryInMockTableByFilter = (tableName, criteria) => {
  const store = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  return store.find(criteria);
}

// Find all entries in a mock table that match a filter
export const findEntriesInMockTableByFilter = (tableName, criteria) => {
  const store = mockTableStores[tableName];
  if (!store) {
    throw new Error(`Table ${tableName} does not exist.`);
  }
  return store.filter(criteria);
}
