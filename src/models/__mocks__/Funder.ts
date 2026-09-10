import casual from "casual";
import { getCurrentDate } from "../../utils/helpers.js";
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
} from "./MockStore.js";
import { MyContext } from "../../context.js";
import { PlanFunding, ProjectFunding, ProjectFundingStatus } from "../Funding.js";
import { getRandomEnumValue } from "../../__tests__/helpers.js";

// The shapes accepted by the real model constructors. These mirror the (unexported)
// options interfaces declared alongside ProjectFunding/PlanFunding in ../Funding.ts.
type ProjectFundingEntry = ConstructorParameters<typeof ProjectFunding>[0];
type PlanFundingEntry = ConstructorParameters<typeof PlanFunding>[0];

// Project fundings
// ---------------------------------------------------
export const getProjectFundingStore = (): ProjectFundingEntry[] => {
  return getMockTableStore<ProjectFundingEntry>('projectFundings');
}

export const getRandomProjectFunding = (): ProjectFunding | null => {
  const store = getMockTableStore<ProjectFundingEntry>('projectFundings');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as ProjectFunding;
}

export const clearProjectFundingStore = () => {
  clearMockTableStore('projectFundings');
}

export const generateNewProjectFunding = (options: Partial<ProjectFundingEntry>): ProjectFundingEntry => {
  return {
    projectId: options.projectId ?? casual.integer(1, 9999),
    affiliationId: options.affiliationId ?? casual.url,
    status: options.status ?? getRandomEnumValue(ProjectFundingStatus),
    funderOpportunityNumber: options.funderOpportunityNumber ?? casual.uuid,
    funderProjectNumber: options.funderProjectNumber ?? casual.uuid,
    grantId: options.grantId ?? casual.url,
  }
}

// Initialize the table
export const initProjectFundingStore = (count = 10): ProjectFunding[] => {
  addMockTableStore<ProjectFundingEntry>('projectFundings', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('projectFundings', generateNewProjectFunding({}));
  }

  // Cast to ProjectFunding[] to match the real model's return shape. The entries are kept as
  // plain data objects (not `new ProjectFunding(...)` instances) so that tests mutating the
  // array returned here continue to mutate the same objects backing the mock table store.
  return getProjectFundingStore() as ProjectFunding[];
}

// Mock the queries
export const mockFindProjectFundingById = async (_: string, __: MyContext, id: number): Promise<ProjectFunding | null> => {
  const result = findEntryInMockTableById<ProjectFundingEntry>('projectFundings', id);
  return result ? new ProjectFunding(result) : null;
};

export const mockFindProjectFundingsByProjectId = async (_: string, __: MyContext, projectId: number): Promise<ProjectFunding[]> => {
  const results = findEntriesInMockTableByFilter<ProjectFundingEntry>(
    'projectFundings',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new ProjectFunding(entry) }) : [];
};

export const mockFindProjectFundingsByAffiliation = async (_: string, __: MyContext, affiliationId: string): Promise<ProjectFunding[]> => {
  const results = findEntriesInMockTableByFilter<ProjectFundingEntry>(
    'projectFundings',
    (entry) => { return entry.affiliationId === affiliationId }
  );
  return results ? results.map((entry) => { return new ProjectFunding(entry) }) : [];
};

export const mockFindProjectFundingsByProjectAndAffiliation = async (
  _: string,
  __: MyContext,
  projectId: number,
  affiliationId: string
): Promise<ProjectFunding | null> => {
  const result = findEntryInMockTableByFilter<ProjectFundingEntry>(
    'projectFundings',
    (entry) => { return entry.projectId === projectId && entry.affiliationId === affiliationId }
  );
  return result ? new ProjectFunding(result) : null;
};

// Mock the mutations
export const mockInsertProjectFunding = async (context: MyContext, _: string, obj: ProjectFunding): Promise<number> => {
  const { insertId } = addEntryToMockTable('projectFundings', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateProjectFunding = async (context: MyContext, _: string, obj: ProjectFunding): Promise<ProjectFunding | null> => {
  const result = updateEntryInMockTable('projectFundings', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new ProjectFunding(result) : null;
};

export const mockDeleteProjectFunding = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('projectFundings', id);
  return result ? true : false;
};


// Plan fundings
// ---------------------------------------------------
export const getPlanFundingStore = (): PlanFundingEntry[] => {
  return getMockTableStore<PlanFundingEntry>('planFundings');
}

export const getRandomPlanFunding = (): PlanFunding | null => {
  const store = getMockTableStore<PlanFundingEntry>('planFundings');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as PlanFunding;
}

export const clearPlanFundingStore = () => {
  clearMockTableStore('planFundings');
}

export const generateNewPlanFunding = (options: Partial<PlanFundingEntry>): PlanFundingEntry => {
  return {
    planId: options.planId ?? casual.integer(1, 9999),
    projectFundingId: options.projectFundingId ?? casual.integer(1, 9999),
  }
}

// Initialize the table
export const initPlanFundingStore = (count = 10): PlanFunding[] => {
  addMockTableStore<PlanFundingEntry>('planFundings', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('planFundings', generateNewPlanFunding({}));
  }

  return getPlanFundingStore() as PlanFunding[];
}

// Mock the queries
export const mockFindPlanFundingById = async (_: string, __: MyContext, id: number): Promise<PlanFunding | null> => {
  const result = findEntryInMockTableById<PlanFundingEntry>('planFundings', id);
  return result ? new PlanFunding(result) : null;
};

// NOTE: the real PlanFunding.findByProjectFundingId/findByPlanId both return PlanFunding[]
// (not a single PlanFunding). Previously this used the plural findEntriesInMockTableByFilter
// but then passed the whole results array into `new PlanFunding(...)` and declared a singular
// return type - fixed to map over the results and return an array, matching ../Funding.ts.
export const mockFindPlanFundingsByProjectFundingId = async (
  _: string,
  __: MyContext,
  projectFundingId: number
): Promise<PlanFunding[]> => {
  const results = findEntriesInMockTableByFilter<PlanFundingEntry>(
    'planFundings',
    (entry) => { return entry.projectFundingId === projectFundingId }
  );
  return Array.isArray(results) ? results.map((entry) => new PlanFunding(entry)) : [];
};

export const mockFindPlanFundingsByPlanId = async (_: string, __: MyContext, planId: number): Promise<PlanFunding[]> => {
  const results = findEntriesInMockTableByFilter<PlanFundingEntry>(
    'planFundings',
    (entry) => { return entry.planId === planId }
  );
  return Array.isArray(results) ? results.map((entry) => new PlanFunding(entry)) : [];
};

// Mock the mutations
export const mockInsertPlanFunding = async (context: MyContext, _: string, obj: PlanFunding): Promise<number> => {
  const { insertId } = addEntryToMockTable('planFundings', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdatePlanFunding = async (context: MyContext, _: string, obj: PlanFunding): Promise<PlanFunding | null> => {
  const result = updateEntryInMockTable('planFundings', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new PlanFunding(result) : null;
};

export const mockDeletePlanFunding = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('planFundings', id);
  return result ? true : false;
};
