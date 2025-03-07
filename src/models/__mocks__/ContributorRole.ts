
import casual from "casual";
import { getCurrentDate } from "../../utils/helpers";
import { addEntryToMockTable, addMockTableStore, clearMockTableStore, deleteEntryFromMockTable, findEntryInMockTableByFilter, findEntryInMockTableById, getMockTableStore, updateEntryInMockTable } from "./MockStore";

export const getContributorRoleStore = () => {
  return getMockTableStore('contributorRoles');
}

export const getRandomContributorRole = () => {
  const store = getMockTableStore('contributorRoles');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

// Initialize the table
export const initContributorRoles = (count = 10) => {
  addMockTableStore('contributorRoles', []);

  for (let i = 0; i < count; i++) {
    const tstamp = getCurrentDate();

    addEntryToMockTable('contributorRoles', {
      id: casual.integer(1, 9999),
      createdById: casual.integer(1, 999),
      created: tstamp,
      modifiedById: casual.integer(1, 999),
      modified: tstamp,
      displayOrder: i,
      uri: casual.url,
      label: casual.words(2),
      description: casual.sentence,
    });
  }

  return getContributorRoleStore();
}

export const clearContributorRoles = () => {
  clearMockTableStore('contributorRoles');
}

// Mock the queries
export const mockFindContributorRoleById = async (_, __, id) => {
  return findEntryInMockTableById('contributorRoles', id);
};

export const mockFindContributorRoleByURL = async (_, __, uri) => {
  return findEntryInMockTableByFilter(
    'contributorRoles',
    (entry) => { return entry.uri.toLowerCase().trim() === uri.toLowerCase().trim() }
  );
};

// Mock the mutations
export const mockInsertContributorRole = async (context, _, obj) => {
  return addEntryToMockTable('contributorRoles', {
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
    ...obj
  });
};

export const mockUpdateContributorRole = async (context, _, obj) => {
  return updateEntryInMockTable('contributorRoles', {
    modifiedById: context.token.id,
    modified: getCurrentDate(),
    ...obj
  });
};

export const mockDeleteContributorRole = async (_, __, id) => {
  return deleteEntryFromMockTable('contributorRoles', id);
};
