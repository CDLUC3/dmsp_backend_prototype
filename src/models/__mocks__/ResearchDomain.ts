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
import { ResearchDomain } from "../ResearchDomain.js";
import { MyContext } from "../../context.js";

// The shape accepted by the real ResearchDomain constructor.
type ResearchDomainEntry = ConstructorParameters<typeof ResearchDomain>[0];

export const getResearchDomainStore = (): ResearchDomainEntry[] => {
  return getMockTableStore<ResearchDomainEntry>('researchDomains');
}

export const getRandomResearchDomain = (): ResearchDomain | null => {
  const store = getMockTableStore<ResearchDomainEntry>('researchDomains');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as ResearchDomain;
}

export const clearResearchDomainStore = () => {
  clearMockTableStore('researchDomains');
}

export const generateNewResearchDomain = (options: Partial<ResearchDomainEntry>): ResearchDomainEntry => {
  return {
    name: options.name ?? casual.sentence,
    uri: options.uri ?? casual.url,
    description: options.description ?? casual.sentences(2),
  }
}

// Initialize the table
export const initResearchDomainStore = (count = 10): ResearchDomain[] => {
  addMockTableStore<ResearchDomainEntry>('researchDomains', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('researchDomains', generateNewResearchDomain({}));
  }

  // Cast to ResearchDomain[] to match the real model's return shape. The entries are kept
  // as plain data objects (not `new ResearchDomain(...)` instances) so that tests mutating
  // the array returned here continue to mutate the same objects backing the mock table store.
  return getResearchDomainStore() as ResearchDomain[];
}

// Mock the queries
export const mockFindResearchDomainById = async (_: string, __: MyContext, id: number): Promise<ResearchDomain | null> => {
  const result = findEntryInMockTableById<ResearchDomainEntry>('researchDomains', id);
  return result ? new ResearchDomain(result) : null;
};

export const mockFindResearchDomainByURI = async (_: string, __: MyContext, uri: string): Promise<ResearchDomain | null> => {
  const result = findEntryInMockTableByFilter<ResearchDomainEntry>(
    'researchDomains',
    (entry) => { return entry.uri.toLowerCase().trim() === uri.toLowerCase().trim() }
  );
  return result ? new ResearchDomain(result) : null;
};

export const mockFindResearchDomainsByName = async (_: string, __: MyContext, name: string): Promise<ResearchDomain[]> => {
  // Filter the researchDomains based on the search term
  const results = findEntriesInMockTableByFilter<ResearchDomainEntry>(
    'researchDomains',
    (entry) => { return entry.name.toLowerCase().trim() === name.toLowerCase().trim() }
  );
  return results ? results.map((entry) => { return new ResearchDomain(entry) }) : [];
};

// Mock the mutations
export const mockInsertResearchDomain = async (context: MyContext, _: string, obj: ResearchDomain): Promise<number> => {
  const { insertId } = addEntryToMockTable('researchDomains', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateResearchDomain = async (context: MyContext, _: string, obj: ResearchDomain): Promise<ResearchDomain | null> => {
  const result = updateEntryInMockTable('researchDomains', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new ResearchDomain(result) : null;
};

export const mockDeleteResearchDomain = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('researchDomains', id);
  return result ? true : false;
};
