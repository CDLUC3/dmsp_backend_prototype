
import casual from "casual";
import { getCurrentDate } from "../../utils/helpers";
import { addEntryToMockTable, addMockTableStore, clearMockTableStore, deleteEntryFromMockTable, findEntriesInMockTableByFilter, findEntryInMockTableByFilter, findEntryInMockTableById, getMockTableStore, updateEntryInMockTable } from "./MockStore";
import { ContributorRole } from "../ContributorRole";

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

  // Add related join tables
  addMockTableStore('projectContributorRoles', []);
  addMockTableStore('planContributorRoles', []);

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

  // clear related join tables
  clearMockTableStore('projectContributorRoles');
  clearMockTableStore('planContributorRoles');
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

export const mockFindByProjectContributorId = async (_, __, projectContributorId) => {
  const results = findEntriesInMockTableByFilter(
    'projectContributorRoles',
    (entry) => { return entry.projectContributorId === projectContributorId }
  );

  if (Array.isArray(results)) {
    const roles = await Promise.all(results.map(async (result) =>
      await mockFindContributorRoleById(null, null, result.contributorRoleId)
    ));
    return Array.isArray(roles) ? roles.map((role) => new ContributorRole(role)) : [];
  }
  return [];
};

export const mockFindByPlanContributorId = async (_, __, planContributorId) => {
  const results = findEntriesInMockTableByFilter(
    'planContributorRoles',
    (entry) => { return entry.planContributorId === planContributorId }
  );
  if (Array.isArray(results)) {
    const roles = await Promise.all(results.map(async (result) =>
      await mockFindContributorRoleById(null, null, result.contributorRoleId)
    ));
    return Array.isArray(roles) ? roles.map((role) => new ContributorRole(role)) : [];
  }
  return [];
};

export const mockDefaultContributorRole = async (): Promise<ContributorRole | null> => {
  const store = getContributorRoleStore();
  return Array.isArray(store) ? store[0] : null;
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

export const mockAddContributorRoleToProjectContributor = async (context, contributorRoleId, projectContributorId) => {
  const contributorRole = findEntryInMockTableById('contributorRoles', contributorRoleId);
  if (!contributorRole) {
    return false; // Contributor role not found
  }

  const projectContributorRolesStore = getMockTableStore('projectContributorRoles');
  if (!projectContributorRolesStore) {
    return false; // Project contributor roles store not found
  }

  const newEntry = {
    contributorRoleId,
    projectContributorId,
    createdById: context.token.id,
    modifiedById: context.token.id,
    created: getCurrentDate(),
    modified: getCurrentDate(),
  };

  projectContributorRolesStore.push(newEntry);
  return true; // Successfully added
};

export const mockRemoveContributorRoleFromProjectContributor = async (_, contributorRoleId, projectContributorId) => {
  const projectContributorRolesStore = getMockTableStore('projectContributorRoles');
  if (!projectContributorRolesStore) {
    return false; // Project contributor roles store not found
  }

  const indexToRemove = projectContributorRolesStore.findIndex(entry =>
    entry.contributorRoleId === contributorRoleId && entry.projectContributorId === projectContributorId
  );

  if (indexToRemove === -1) {
    return false; // Entry not found
  }

  projectContributorRolesStore.splice(indexToRemove, 1);
  return true; // Successfully removed
};

export const mockAddContributorRoleToPlanContributor = async (context, contributorRoleId, planContributorId) => {
  const contributorRole = findEntryInMockTableById('contributorRoles', contributorRoleId);
  if (!contributorRole) {
    return false; // Contributor role not found
  }

  const planContributorRolesStore = getMockTableStore('planContributorRoles');
  if (!planContributorRolesStore) {
    return false; // Plan contributor roles store not found
  }

  const newEntry = {
    contributorRoleId,
    planContributorId,
    createdById: context.token.id,
    modifiedById: context.token.id,
    created: getCurrentDate(),
    modified: getCurrentDate(),
  };

  planContributorRolesStore.push(newEntry);
  return true; // Successfully added
};

export const mockRemoveContributorRoleFromPlanContributor = async (_, contributorRoleId, planContributorId) => {
  const planContributorRolesStore = getMockTableStore('planContributorRoles');
  if (!planContributorRolesStore) {
    return false; // Plan contributor roles store not found
  }

  const indexToRemove = planContributorRolesStore.findIndex(entry =>
    entry.contributorRoleId === contributorRoleId && entry.planContributorId === planContributorId
  );

  if (indexToRemove === -1) {
    return false; // Entry not found
  }

  planContributorRolesStore.splice(indexToRemove, 1);
  return true; // Successfully removed
};
