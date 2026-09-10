
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
} from "./MockStore.js";
import { getCurrentDate } from "../../utils/helpers.js";
import { getMockDMPId, getRandomEnumValue } from "../../__tests__/helpers.js";
import { Plan, PlanSearchResult, PlanStatus, PlanVisibility } from "../Plan.js";
import { supportedLanguages } from "../Language.js";
import { MyContext } from "../../context.js";

// The shape accepted by the real Plan constructor.
type PlanEntry = ConstructorParameters<typeof Plan>[0];

export const getPlanStore = (): PlanEntry[] => {
  return getMockTableStore<PlanEntry>('plans');
}

export const getRandomPlan = (): Plan | null => {
  const store = getMockTableStore<PlanEntry>('plans');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as Plan;
}

export const clearPlanStore = () => {
  clearMockTableStore('plans');
}

export const generateNewPlan = (options: Partial<PlanEntry>): PlanEntry => {
  return {
    projectId: options.projectId ?? casual.integer(1, 9999),
    versionedTemplateId: options.versionedTemplateId ?? casual.integer(1, 9999),
    title: options.title ?? casual.sentence,
    status: options.status ?? getRandomEnumValue(PlanStatus),
    visibility: options.visibility ?? getRandomEnumValue(PlanVisibility),
    dmpId: options.dmpId ?? getMockDMPId(),
    registered: options.registered ?? casual.date('YYYY-MM-DD'),
    registeredById: options.registeredById ?? casual.integer(1, 9999),
    languageId: options.languageId ?? supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)].id,
    featured: options.featured ?? casual.boolean,
  }
}

// Converts a Mock Store Plan into a PlanSearchResult. Note that some data is mocked
// because we do not have access to the other stores here
const planToPlanSearchResult = (plan: Plan): PlanSearchResult => {
  return {
    // The fields below are guaranteed to be set on any Plan pulled back out of the mock
    // store (addEntryToMockTable always assigns id/createdById/created/modifiedById/modified),
    // even though MySqlModel types them as optional to also support not-yet-saved instances.
    id: plan.id as number,
    createdBy: casual.full_name,
    createdById: plan.createdById as number,
    created: plan.created as string,
    modifiedBy: casual.full_name,
    modified: plan.modified as string,
    title: plan.title,
    status: plan.status,
    visibility: plan.visibility,
    dmpId: plan.dmpId,
    registeredBy: casual.full_name,
    registered: plan.registered,
    featured: plan.featured,
    funding: casual.company_name,
    members: casual.full_name,
    templateTitle: casual.title,
    versionedTemplateId: plan.versionedTemplateId,
    templateOwnerAffiliationName: casual.company_name,
  }
}

// Initialize the table
export const initPlanStore = (count = 10): Plan[] => {
  addMockTableStore<PlanEntry>('plans', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('plans', generateNewPlan({}));
  }

  // Cast to Plan[] to match the real model's return shape. The entries are kept as plain
  // data objects (not `new Plan(...)` instances) so that tests mutating the array returned
  // here continue to mutate the same objects backing the mock table store.
  return getPlanStore() as Plan[];
}

// Mock the queries
export const mockFindPlanById = async (_: string, __: MyContext, id: number): Promise<Plan | null> => {
  const result = findEntryInMockTableById<PlanEntry>('plans', id);
  return result ? new Plan(result) : null;
};

export const mockFindPlanByDMPId = async (_: string, __: MyContext, dmpId: string): Promise<Plan | null> => {
  const result = findEntryInMockTableByFilter<PlanEntry>(
    'plans',
    (entry) => { return entry.dmpId?.toLowerCase()?.trim() === dmpId.toLowerCase().trim() }
  );
  return result ? new Plan(result) : null;
};

// Mock the PlanSearchResult query
export const mockFindPlanSearchResultsByProjectId = async (_: string, __: MyContext, projectId: number): Promise<PlanSearchResult[]> => {
  // Filter the plans based on the search term
  const results = findEntriesInMockTableByFilter<PlanEntry>(
    'plans',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return planToPlanSearchResult(new Plan(entry)) }) : [];
};

export const mockFindPlansByProjectId = async (_: string, __: MyContext, projectId: number): Promise<Plan[]> => {
  // Filter the plans based on the search term
  const results = findEntriesInMockTableByFilter<PlanEntry>(
    'plans',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new Plan(entry) }) : [];
};

// Mock the PlanSearchResult query
// NOTE: this previously declared a `Plan[]` return type but constructed `new
// PlanSearchResult(entry)` directly from a raw plan store row (missing the
// createdBy/modifiedBy/funding/members/templateTitle/etc. fields PlanSearchResult requires,
// since those are normally synthesized via joins in the real SQL query). It's unused
// elsewhere (mockFindPlanSearchResultsByProjectId above is what's actually wired up via
// jest.spyOn), so fixed it to mirror that same conversion instead of constructing an
// incompatible object.
export const mockPlanSearchResultFindByProjectId = async (_: string, __: MyContext, projectId: number): Promise<PlanSearchResult[]> => {
  // Filter the plans based on the search term
  const results = findEntriesInMockTableByFilter<PlanEntry>(
    'plans',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return planToPlanSearchResult(new Plan(entry)) }) : [];
};

// Mock the mutations
export const mockInsertPlan = async (context: MyContext, _: string, obj: Plan): Promise<number> => {
  const { insertId } = addEntryToMockTable('plans', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdatePlan = async (context: MyContext, _: string, obj: Plan): Promise<Plan | null> => {
  const result = updateEntryInMockTable('plans', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new Plan(result) : null;
};

export const mockDeletePlan = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('plans', id);
  return result ? true : false;
};
