
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
import { VersionedTemplate } from "../VersionedTemplate";
import { MyContext } from "../../context";
import { getMockROR, getRandomEnumValue } from "../../__tests__/helpers";
import { TemplateVersionType } from "../VersionedTemplate";
import { TemplateVisibility } from "../Template";

export const getVersionedTemplateStore = () => {
  return getMockTableStore('versionedTemplates');
}

export const getRandomVersionedTemplate = (): VersionedTemplate => {
  const store = getMockTableStore('versionedTemplates');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearVersionedTemplateStore = () => {
  clearMockTableStore('versionedTemplates');
}

export const generateNewVersionedTemplate = (options) => {
  return {
    templateId: options.templateId ?? casual.integer(1, 9999),
    version: options.version ?? `v${casual.integer(1, 10)}`,
    versionedById: options.versionedById ?? casual.integer(1, 9999),
    name: options.name ?? casual.sentence,
    description: options.description ?? casual.sentences(2),
    ownerId: options.ownerId ?? getMockROR(),
    versionType: options.versionType ?? getRandomEnumValue(TemplateVersionType),
    comment: options.comment ?? casual.sentence,
    active: options.active ?? casual.boolean,
    visibility: options.visibility ?? getRandomEnumValue(TemplateVisibility),
    bestPractice: options.bestPractice ?? casual.boolean,
    languageId: options.languageId ?? 'en-US',
  }
}

// Initialize the table
export const initVersionedTemplateStore = (count = 10): VersionedTemplate[] => {
  addMockTableStore('versionedTemplates', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('versionedTemplates', generateNewVersionedTemplate({}));
  }

  return getVersionedTemplateStore();
}

// Mock the queries
export const mockFindVersionedTemplateById = async (_, __, id: number): Promise<VersionedTemplate> => {
  const result = findEntryInMockTableById('versionedTemplates', id);
  return result ? new VersionedTemplate(result) : null;
};

export const mockFindVersionedTemplateByDMPId = async (_, __, dmpId: string): Promise<VersionedTemplate> => {
  const result = findEntryInMockTableByFilter(
    'versionedTemplates',
    (entry) => { return entry.dmpId.toLowerCase().trim() === dmpId.toLowerCase().trim() }
  );
  return result ? new VersionedTemplate(result) : null;
};

export const mockFindVersionedTemplatesByVersionedTemplateId = async (_, { projectId }: { projectId: number }): Promise<VersionedTemplate[]> => {
  // Filter the versionedTemplates based on the search term
  const results = findEntriesInMockTableByFilter(
    'versionedTemplates',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new VersionedTemplate(entry) }) : [];
};

// Mock the mutations
export const mockInsertVersionedTemplate = async (context: MyContext, _, obj: VersionedTemplate): Promise<number> => {
  const { insertId } = addEntryToMockTable('versionedTemplates', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateVersionedTemplate = async (context: MyContext, _, obj: VersionedTemplate): Promise<VersionedTemplate> => {
  const result = updateEntryInMockTable('versionedTemplates', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new VersionedTemplate(result) : null;
};

export const mockDeleteVersionedTemplate = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('versionedTemplates', id);
  return result ? true : false;
};
