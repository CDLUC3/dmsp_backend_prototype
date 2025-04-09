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
import { MyContext } from "../../context";
import { PlanFunder, ProjectFunder, ProjectFunderStatus } from "../Funder";
import { getRandomEnumValue } from "../../__tests__/helpers";

// Project funders
// ---------------------------------------------------
export const getProjectFunderStore = () => {
  return getMockTableStore('projectFunders');
}

export const getRandomProjectFunder = (): ProjectFunder => {
  const store = getMockTableStore('projectFunders');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearProjectFunderStore = () => {
  clearMockTableStore('projectFunders');
}

export const generateNewProjectFunder = (options) => {
  return {
    projectId: options.projectId ?? casual.integer(1, 9999),
    affiliationId: options.affiliationId ?? casual.url,
    status: options.status ?? getRandomEnumValue(ProjectFunderStatus),
    funderOpportunityNumber: options.funderOpportunityNumber ?? casual.uuid,
    funderProjectNumber: options.funderProjectNumber ?? casual.uuid,
    grantId: options.grantId ?? casual.url,
  }
}

// Initialize the table
export const initProjectFunderStore = (count = 10): ProjectFunder[] => {
  addMockTableStore('projectFunders', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('projectFunders', generateNewProjectFunder({}));
  }

  return getProjectFunderStore();
}

// Mock the queries
export const mockFindProjectFunderById = async (_, __, id: number): Promise<ProjectFunder> => {
  const result = findEntryInMockTableById('projectFunders', id);
  return result ? new ProjectFunder(result) : null;
};

export const mockFindProjectFundersByProjectId = async (_, __, projectId: number): Promise<ProjectFunder[]> => {
  const results = findEntriesInMockTableByFilter(
    'projectFunders',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new ProjectFunder(entry) }) : [];
};

export const mockFindProjectFundersByAffiliation = async (_, __, affiliationId: string): Promise<ProjectFunder[]> => {
  const results = findEntriesInMockTableByFilter(
    'projectFunders',
    (entry) => { return entry.affiliationId === affiliationId }
  );
  return results ? results.map((entry) => { return new ProjectFunder(entry) }) : [];
};

export const mockFindProjectFundersByProjectAndAffiliation = async (
  _,
  __,
  projectId: number,
  affiliationId: string
): Promise<ProjectFunder> => {
  const result = findEntryInMockTableByFilter(
    'projectFunders',
    (entry) => { return entry.projectId === projectId && entry.affiliationId === affiliationId }
  );
  return result ? new ProjectFunder(result) : null;
};

// Mock the mutations
export const mockInsertProjectFunder = async (context: MyContext, _, obj: ProjectFunder): Promise<number> => {
  const { insertId } = addEntryToMockTable('projectFunders', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateProjectFunder = async (context: MyContext, _, obj: ProjectFunder): Promise<ProjectFunder> => {
  const result = updateEntryInMockTable('projectFunders', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new ProjectFunder(result) : null;
};

export const mockDeleteProjectFunder = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('projectFunders', id);
  return result ? true : false;
};


// Plan funders
// ---------------------------------------------------
export const getPlanFunderStore = () => {
  return getMockTableStore('planFunders');
}

export const getRandomPlanFunder = (): PlanFunder => {
  const store = getMockTableStore('planFunders');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearPlanFunderStore = () => {
  clearMockTableStore('planFunders');
}

export const generateNewPlanFunder = (options) => {
  return {
    planId: options.planId ?? casual.integer(1, 9999),
    projectFunderId: options.projectFunderId ?? casual.integer(1, 9999),
  }
}

// Initialize the table
export const initPlanFunderStore = (count = 10): PlanFunder[] => {
  addMockTableStore('planFunders', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('planFunders', generateNewPlanFunder({}));
  }

  return getPlanFunderStore();
}

// Mock the queries
export const mockFindPlanFunderById = async (_, __, id: number): Promise<PlanFunder> => {
  const result = findEntryInMockTableById('planFunders', id);
  return result ? new PlanFunder(result) : null;
};

export const mockFindPlanFundersByProjectFunderId = async (_, __, projectFunderId: number): Promise<PlanFunder> => {
  const result = findEntriesInMockTableByFilter(
    'planFunders',
    (entry) => { return entry.projectFunderId === projectFunderId }
  );
  return result ? new PlanFunder(result) : null;
};

export const mockFindPlanFundersByPlanId = async (_, __, planId: number): Promise<PlanFunder> => {
  const result = findEntriesInMockTableByFilter(
    'planFunders',
    (entry) => { return entry.planId === planId }
  );
  return result ? new PlanFunder(result) : null;
};

// Mock the mutations
export const mockInsertPlanFunder = async (context: MyContext, _, obj: PlanFunder): Promise<number> => {
  const { insertId } = addEntryToMockTable('planFunders', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdatePlanFunder = async (context: MyContext, _, obj: PlanFunder): Promise<PlanFunder> => {
  const result = updateEntryInMockTable('planFunders', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new PlanFunder(result) : null;
};

export const mockDeletePlanFunder = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('planFunders', id);
  return result ? true : false;
};
