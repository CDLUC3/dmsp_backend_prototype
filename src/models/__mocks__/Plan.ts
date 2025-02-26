
import casual from "casual";
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
import { getCurrentDate } from "../../utils/helpers";
import { getMockDMPId, getRandomEnumValue } from "../../__tests__/helpers";
import { Plan, PlanStatus, PlanVisibility } from "../Plan";
import { supportedLanguages } from "../Language";
import { MyContext } from "../../context";

export const getPlanStore = () => {
  return getMockTableStore('plans');
}

export const getRandomPlan = (): Plan => {
  const store = getMockTableStore('plans');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearPlanStore = () => {
  clearMockTableStore('plans');
}

export const generateNewPlan = (options) => {
  return {
    projectId: options.projectId ?? casual.integer(1, 9999),
    versionedTemplateId: options.versionedTemplateId ?? casual.integer(1, 9999),
    status: options.status ?? getRandomEnumValue(PlanStatus),
    visibility: options.visibility ?? getRandomEnumValue(PlanVisibility),
    dmpId: options.dmpId ?? getMockDMPId(),
    registered: options.registered ?? casual.date('YYYY-MM-DD'),
    registeredById: options.registeredById ?? casual.integer(1, 9999),
    languageId: options.languageId ?? supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)].id,
    featured: options.featured ?? casual.boolean,
    lastSynced: options.lastSync ?? casual.date('YYYY-MM-DD'),
  }
}

// Initialize the table
export const initPlanStore = (count = 10): Plan[] => {
  addMockTableStore('plans', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('plans', generateNewPlan({}));
  }

  return getPlanStore();
}

// Mock the queries
export const mockFindPlanById = async (_, __, id: number): Promise<Plan> => {
  const result = findEntryInMockTableById('plans', id);
  return result ? new Plan(result) : null;
};

export const mockFindPlanByDMPId = async (_, __, dmpId: string): Promise<Plan> => {
  const result = findEntryInMockTableByFilter(
    'plans',
    (entry) => { return entry.dmpId.toLowerCase().trim() === dmpId.toLowerCase().trim() }
  );
  return result ? new Plan(result) : null;
};

export const mockFindPlansByProjectId = async (_, { projectId }: { projectId: number }): Promise<Plan[]> => {
  // Filter the plans based on the search term
  const results = findEntriesInMockTableByFilter(
    'plans',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new Plan(entry) }) : [];
};

// Mock the mutations
export const mockInsertPlan = async (context: MyContext, _, obj: Plan): Promise<number> => {
  const newObj = generateNewPlan(obj);
  const { insertId } = addEntryToMockTable('plans', {
    ...newObj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdatePlan = async (context: MyContext, _, obj: Plan): Promise<Plan> => {
  const result = updateEntryInMockTable('plans', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new Plan(result) : null;
};

export const mockDeletePlan = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('plans', id);
  return result ? true : false;
};
