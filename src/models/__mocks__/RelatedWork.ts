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
import { RelatedWork, RelatedWorkRelationDescriptor, RelatedWorkType } from "../RelatedWork";
import { MyContext } from "../../context";
import { getRandomEnumValue } from "../../__tests__/helpers";

export const getRelatedWorkStore = () => {
  return getMockTableStore('relatedWorks');
}

export const getRandomRelatedWork = (): RelatedWork => {
  const store = getMockTableStore('relatedWorks');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearRelatedWorkStore = () => {
  clearMockTableStore('relatedWorks');
}

export const generateNewRelatedWork = (options) => {
  return {
    projectId: options.projectId ?? casual.integer(1, 9999),
    workType: options.workType ?? getRandomEnumValue(RelatedWorkType),
    relationDescriptor: options.relationDescriptor ?? getRandomEnumValue(RelatedWorkRelationDescriptor),
    identifier: options.identifier ?? casual.uuid,
    citation: options.citation ?? casual.sentences(3),
  }
}

// Initialize the table
export const initRelatedWorkStore = (count = 10): RelatedWork[] => {
  addMockTableStore('relatedWorks', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('relatedWorks', generateNewRelatedWork({}));
  }

  return getRelatedWorkStore();
}

// Mock the queries
export const mockFindRelatedWorkById = async (_, __, id: number): Promise<RelatedWork> => {
  const result = findEntryInMockTableById('relatedWorks', id);
  return result ? new RelatedWork(result) : null;
};

export const mockFindRelatedWorkByProjectAndIdentifier = async (_, __, projectId: number, identifier: string): Promise<RelatedWork> => {
  const result = findEntryInMockTableByFilter(
    'relatedWorks',
    (entry) => { return entry.identifier.trim() === identifier.trim() && entry.projectId === projectId }
  );
  return result ? new RelatedWork(result) : null;
};

export const mockFindRelatedWorksByIdentifier = async (_, __, identifier: string): Promise<RelatedWork[]> => {
  // Filter the relatedWorks based on the search term
  const results = findEntriesInMockTableByFilter(
    'relatedWorks',
    (entry) => { return entry.identifier.trim() === identifier.trim() }
  );
  return results ? results.map((entry) => { return new RelatedWork(entry) }) : [];
};

export const mockFindRelatedWorksByProjectId = async (_, __, projectId: number): Promise<RelatedWork[]> => {
  // Filter the relatedWorks based on the search term
  const results = findEntriesInMockTableByFilter(
    'relatedWorks',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new RelatedWork(entry) }) : [];
};

// Mock the mutations
export const mockInsertRelatedWork = async (context: MyContext, _, obj: RelatedWork): Promise<number> => {
  const { insertId } = addEntryToMockTable('relatedWorks', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateRelatedWork = async (context: MyContext, _, obj: RelatedWork): Promise<RelatedWork> => {
  const result = updateEntryInMockTable('relatedWorks', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new RelatedWork(result) : null;
};

export const mockDeleteRelatedWork = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('relatedWorks', id);
  return result ? true : false;
};
