
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
import { Project } from "../Project.js";
import { MyContext } from "../../context.js";

// The shape accepted by the real Project constructor.
type ProjectEntry = ConstructorParameters<typeof Project>[0];

export const getProjectStore = (): ProjectEntry[] => {
  return getMockTableStore<ProjectEntry>('projects');
}

export const getRandomProject = (): Project | null => {
  const store = getMockTableStore<ProjectEntry>('projects');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as Project;
}

export const clearProjectStore = () => {
  clearMockTableStore('projects');
}

export const generateNewProject = (options: Partial<ProjectEntry>): ProjectEntry => {
  return {
    title: options.title ?? casual.sentence,
    abstractText: options.abstractText ?? casual.sentences(4),
    startDate: options.startDate ?? '2024-12-13',
    endDate: options.endDate ?? '2026-01-21',
    researchDomainId: options.researchDomainId ?? casual.integer(1, 99),
    isTestProject: options.isTestProject ?? casual.boolean,
  }
}

// Initialize the table
export const initProjectStore = (count = 10): Project[] => {
  addMockTableStore<ProjectEntry>('projects', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('projects', generateNewProject({}));
  }

  // Cast to Project[] to match the real model's return shape. The entries are kept as
  // plain data objects (not `new Project(...)` instances) so that tests mutating the
  // array returned here continue to mutate the same objects backing the mock table store.
  return getProjectStore() as Project[];
}

// Mock the queries
export const mockFindProjectById = async (_: string, __: MyContext, id: number): Promise<Project | null> => {
  const result = findEntryInMockTableById<ProjectEntry>('projects', id);
  return result ? new Project(result) : null;
};

// NOTE: Project has no `dmpId` field (that lives on Plan) and this isn't wired up to any real
// Project static method (there's no Project.findByDMPId) - it's unused elsewhere. Kept as-is
// but typed via a local intersection so it still compiles without adding a bogus field to the
// real ProjectEntry shape used everywhere else in this file.
export const mockFindProjectByDMPId = async (_: string, __: MyContext, dmpId: string): Promise<Project | null> => {
  const result = findEntryInMockTableByFilter<ProjectEntry & { dmpId?: string }>(
    'projects',
    (entry) => { return entry.dmpId?.toLowerCase()?.trim() === dmpId.toLowerCase().trim() }
  );
  return result ? new Project(result) : null;
};

// NOTE: Project has no `projectId` field (a project isn't associated with another project) and
// this isn't wired up to any real Project static method either - unused elsewhere. Same
// approach as mockFindProjectByDMPId above.
export const mockFindProjectsByProjectId = async (_: string, { projectId }: { projectId: number }): Promise<Project[]> => {
  // Filter the projects based on the search term
  const results = findEntriesInMockTableByFilter<ProjectEntry & { projectId?: number }>(
    'projects',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new Project(entry) }) : [];
};

// Mock the mutations
export const mockInsertProject = async (context: MyContext, _: string, obj: Project): Promise<number> => {
  const { insertId } = addEntryToMockTable('projects', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateProject = async (context: MyContext, _: string, obj: Project): Promise<Project | null> => {
  const result = updateEntryInMockTable('projects', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new Project(result) : null;
};

export const mockDeleteProject = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('projects', id);
  return result ? true : false;
};
