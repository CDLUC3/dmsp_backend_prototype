import casual from "casual";
import { getCurrentDate } from "../../utils/helpers";
import {
  addEntryToMockTable,
  addMockTableStore,
  clearMockTableStore,
  deleteEntryFromMockTable,
  findEntriesInMockTableByFilter,
  findEntryInMockTableByFilter,
  findEntryInMockTableById,
  getMockTableStore,
  updateEntryInMockTable
} from "./MockStore";
import { getContributorRoleStore, getRandomContributorRole, initContributorRoles } from "./ContributorRole";
import { getMockORCID } from "../../__tests__/helpers";
import { MyContext } from "../../context";
import { PlanContributor, ProjectContributor } from "../Contributor";

// Project contributors
// ---------------------------------------------------
export const getProjectContributorStore = () => {
  return getMockTableStore('projectContributors');
}

export const getRandomProjectContributor = (): ProjectContributor => {
  const store = getMockTableStore('projectContributors');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearProjectContributorStore = () => {
  clearMockTableStore('projectContributors');
}

export const generateNewProjectContributor = (options) => {
  return {
    projectId: options.projectId ?? casual.integer(1, 9999),
    givenName: options.givenName ?? casual.first_name,
    surName: options.surName ?? casual.last_name,
    affiliationId: options.affiliationId ?? casual.url,
    orcid: options.orcid ?? getMockORCID(),
    email: options.email ?? casual.email,
    contributorRoles: [getRandomContributorRole().id],
  }
}

// Initialize the table
export const initProjectContributorStore = (count = 10): ProjectContributor[] => {
  addMockTableStore('projectContributors', []);

  // Since the Contributor has an association with ContributorRole, we need to make sure the ContributorRole
  // table is initialized first
  const contributorRoleStore = getContributorRoleStore();
  if (!contributorRoleStore || contributorRoleStore.length === 0) {
    initContributorRoles();
  }

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('projectContributors', generateNewProjectContributor({}));
  }

  return getProjectContributorStore();
}

// Mock the queries
export const mockFindProjectContributorById = async (_, __, id: number): Promise<ProjectContributor> => {
  const result = findEntryInMockTableById('projectContributors', id);
  return result ? new ProjectContributor(result) : null;
};

export const mockFindProjectContributorsByProjectId = async (_, __, projectId: number): Promise<ProjectContributor[]> => {
  const results = findEntriesInMockTableByFilter(
    'projectContributors',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new ProjectContributor(entry) }) : [];
};

export const mockFindProjectContributorsByAffiliation = async (_, __, affiliationId: string): Promise<ProjectContributor[]> => {
  const results = findEntriesInMockTableByFilter(
    'projectContributors',
    (entry) => { return entry.affiliationId === affiliationId }
  );
  return results ? results.map((entry) => { return new ProjectContributor(entry) }) : [];
};

export const mockFindProjectContributorsByProjectAndEmail = async (
  _,
  __,
  projectId: number,
  email: string
): Promise<ProjectContributor> => {
  const result = findEntryInMockTableByFilter(
    'projectContributors',
    (entry) => { return entry.projectId === projectId && entry.email.toLowerCase().trim() === email.toLowerCase().trim() }
  );
  return result ? new ProjectContributor(result) : null;
};

export const mockFindProjectContributorsByProjectAndORCID = async (
  _,
  __,
  projectId: number,
  orcid: string
): Promise<ProjectContributor> => {
  const result = findEntryInMockTableByFilter(
    'projectContributors',
    (entry) => { return entry.projectId === projectId && entry.orcid.toLowerCase().trim() === orcid.toLowerCase().trim() }
  );
  return result ? new ProjectContributor(result) : null;
};

export const mockFindProjectContributorsByProjectAndName = async (
  _,
  __,
  projectId: number,
  givenName: string,
  surName: string
): Promise<ProjectContributor> => {
  const result = findEntryInMockTableByFilter(
    'projectContributors',
    (entry) => {
      return entry.projectId === projectId &&
        entry.givenName.toLowerCase().trim() === givenName.toLowerCase().trim() &&
        entry.surName.toLowerCase().trim() === surName.toLowerCase().trim();
    }
  );
  return result ? new ProjectContributor(result) : null;
};

export const mockFindProjectContributorsByProjectAndNameOrORCIDOrEmail = async (
  _,
  __,
  projectId: number,
  givenName: string,
  surName: string,
  orcid: string,
  email: string
): Promise<ProjectContributor> => {
  const result = findEntriesInMockTableByFilter(
    'projectContributors',
    (entry) => {
      return entry.projectId === projectId &&
        ((entry.givenName.toLowerCase().trim() === givenName.toLowerCase().trim() &&
          entry.surName.toLowerCase().trim() === surName.toLowerCase().trim()) ||
          entry.orcid.toLowerCase().trim() === orcid.toLowerCase().trim() ||
          entry.email.toLowerCase().trim() === email.toLowerCase().trim());
    }
  );
  return result ? new ProjectContributor(result) : null;
};

// Mock the mutations
export const mockInsertProjectContributor = async (context: MyContext, _, obj: ProjectContributor): Promise<number> => {
  const newObj = generateNewProjectContributor(obj);
  const { insertId } = addEntryToMockTable('projectContributors', {
    ...newObj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateProjectContributor = async (context: MyContext, _, obj: ProjectContributor): Promise<ProjectContributor> => {
  const result = updateEntryInMockTable('projectContributors', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new ProjectContributor(result) : null;
};

export const mockDeleteProjectContributor = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('projectContributors', id);
  return result ? true : false;
};


// Plan contributors
// ---------------------------------------------------
export const getPlanContributorStore = () => {
  return getMockTableStore('planContributors');
}

export const getRandomPlanContributor = (): PlanContributor => {
  const store = getMockTableStore('planContributors');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearPlanContributorStore = () => {
  clearMockTableStore('planContributors');
}

export const generateNewPlanContributor = (options) => {
  return {
    planId: options.projectId ?? casual.integer(1, 9999),
    projectContributorId: options.projectContributorId ?? casual.integer(1, 9999),
    contributorRoles: [getRandomContributorRole().id],
  }
}

// Initialize the table
export const initPlanContributorStore = (count = 10): PlanContributor[] => {
  addMockTableStore('planContributors', []);

  // Since the Contributor has an association with ContributorRole, we need to make sure the ContributorRole
  // table is initialized first
  const contributorRoleStore = getContributorRoleStore();
  if (!contributorRoleStore || contributorRoleStore.length === 0) {
    initContributorRoles();
  }

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('planContributors', generateNewPlanContributor({}));
  }

  return getPlanContributorStore();
}

// Mock the queries
export const mockFindPlanContributorById = async (_, __, id: number): Promise<PlanContributor> => {
  const result = findEntryInMockTableById('planContributors', id);
  return result ? new PlanContributor(result) : null;
};

export const mockFindPlanContributorsByProjectContributorId = async (_, __, projectContributorId: number): Promise<PlanContributor> => {
  const result = findEntriesInMockTableByFilter(
    'planContributors',
    (entry) => { return entry.projectContributorId === projectContributorId }
  );
  return result ? new PlanContributor(result) : null;
};

// Mock the mutations
export const mockInsertPlanContributor = async (context: MyContext, _, obj: PlanContributor): Promise<number> => {
  const newObj = generateNewPlanContributor(obj);
  const { insertId } = addEntryToMockTable('planContributors', {
    ...newObj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdatePlanContributor = async (context: MyContext, _, obj: PlanContributor): Promise<PlanContributor> => {
  const result = updateEntryInMockTable('planContributors', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new PlanContributor(result) : null;
};

export const mockDeletePlanContributor = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('planContributors', id);
  return result ? true : false;
};
