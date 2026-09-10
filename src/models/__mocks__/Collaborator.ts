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
import { ProjectCollaborator, TemplateCollaborator } from "../Collaborator.js";
import { MyContext } from "../../context.js";

// The shapes accepted by the real model constructors. These mirror the (unexported)
// options interfaces declared alongside TemplateCollaborator/ProjectCollaborator in
// ../Collaborator.ts.
type TemplateCollaboratorEntry = ConstructorParameters<typeof TemplateCollaborator>[0];
type ProjectCollaboratorEntry = ConstructorParameters<typeof ProjectCollaborator>[0];

// Template Collaborator
// ---------------------------------------------------
export const getTemplateCollaboratorStore = (): TemplateCollaboratorEntry[] => {
  return getMockTableStore<TemplateCollaboratorEntry>('templateCollaborators');
}

export const getRandomTemplateCollaborator = (): TemplateCollaborator | null => {
  const store = getMockTableStore<TemplateCollaboratorEntry>('templateCollaborators');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as TemplateCollaborator;
}

export const clearTemplateCollaboratorsStore = () => {
  clearMockTableStore('templateCollaborators');
}

export const generateNewTemplateCollaborators = (options: Partial<TemplateCollaboratorEntry>): TemplateCollaboratorEntry => {
  return {
    templateId: options.templateId ?? casual.integer(1, 9999),
    email: options.email ?? casual.email,
    invitedById: options.invitedById ?? casual.integer(1, 9999),
    // Sometimes the userId is undefined, for example if the user has not accepted the invitation yet
    userId: options.userId ?? Math.random() < 0.5 ? undefined : casual.integer(1, 9999),
  };
}

// Initialize the table
export const initTemplateCollaboratorsStore = (count = 10): TemplateCollaborator[] => {
  addMockTableStore<TemplateCollaboratorEntry>('templateCollaborators', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('templateCollaborators', generateNewTemplateCollaborators({}));
  }

  // Cast to TemplateCollaborator[] to match the real model's return shape. The entries are
  // kept as plain data objects (not `new TemplateCollaborator(...)` instances) so that tests
  // mutating the array returned here continue to mutate the same objects backing the mock
  // table store.
  return getTemplateCollaboratorStore() as TemplateCollaborator[];
}

// Mock the queries
export const mockFindTemplateCollaboratorById = async (_: string, __: MyContext, id: number): Promise<TemplateCollaborator | null> => {
  const result = findEntryInMockTableById<TemplateCollaboratorEntry>('templateCollaborators', id);
  return result ? new TemplateCollaborator(result) : null;
};

export const mockFindTemplateCollaboratorsByInviterId = async (_: string, __: MyContext, invitedById: number): Promise<TemplateCollaborator[]> => {
  const results = findEntriesInMockTableByFilter<TemplateCollaboratorEntry>(
    'templateCollaborators',
    (entry) => { return entry.invitedById === invitedById }
  );
  return results ? results.map((entry) => { return new TemplateCollaborator(entry) }) : [];
};

export const mockFindTemplateCollaboratorsByEmail = async (_: string, __: MyContext, email: string): Promise<TemplateCollaborator[]> => {
  const results = findEntriesInMockTableByFilter<TemplateCollaboratorEntry>(
    'templateCollaborators',
    (entry) => { return entry.email.toLowerCase().trim() === email.toLowerCase().trim() }
  );
  return results ? results.map((entry) => { return new TemplateCollaborator(entry) }) : [];
};

export const mockFindTemplateCollaboratorByTemplateIdAndEmail = async (
  _: string,
  __: MyContext,
  templateId: number,
  email: string
): Promise<TemplateCollaborator | null> => {
  const result = findEntryInMockTableByFilter<TemplateCollaboratorEntry>(
    'templateCollaborators',
    (entry) => {
      return entry.templateId === templateId && entry.email.toLowerCase().trim() === email.toLowerCase().trim()
    }
  );
  return result ? new TemplateCollaborator(result) : null;
};

export const mockFindTemplateCollaboratorByTemplateId = async (_: string, __: MyContext, templateId: number): Promise<TemplateCollaborator[]> => {
  const results = findEntriesInMockTableByFilter<TemplateCollaboratorEntry>(
    'templateCollaborators',
    (entry) => { return entry.templateId === templateId }
  );
  return results ? results.map((entry) => { return new TemplateCollaborator(entry) }) : [];
};

// Mock the mutations
export const mockInsertTemplateCollaborators = async (context: MyContext, _: string, obj: TemplateCollaborator): Promise<number> => {
  const { insertId } = addEntryToMockTable('templateCollaborators', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateTemplateCollaborators = async (context: MyContext, _: string, obj: TemplateCollaborator): Promise<TemplateCollaborator | null> => {
  const result = updateEntryInMockTable('templateCollaborators', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new TemplateCollaborator(result) : null;
};

export const mockDeleteTemplateCollaborators = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('templateCollaborators', id);
  return result ? true : false;
};


// Project Collaborator
// ---------------------------------------------------
export const getProjectCollaboratorStore = (): ProjectCollaboratorEntry[] => {
  return getMockTableStore<ProjectCollaboratorEntry>('projectCollaborators');
}

export const getRandomProjectCollaborator = (): ProjectCollaborator | null => {
  const store = getMockTableStore<ProjectCollaboratorEntry>('projectCollaborators');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as ProjectCollaborator;
}

export const clearProjectCollaboratorsStore = () => {
  clearMockTableStore('projectCollaborators');
}

export const generateNewProjectCollaborators = (options: Partial<ProjectCollaboratorEntry>): ProjectCollaboratorEntry => {
  return {
    // NOTE: this previously set `templateId` (copy/pasted from generateNewTemplateCollaborators)
    // which isn't a field on ProjectCollaborator at all - the real class expects `projectId`.
    projectId: options.projectId ?? casual.integer(1, 9999),
    email: options.email ?? casual.email,
    invitedById: options.invitedById ?? casual.integer(1, 9999),
    // Sometimes the userId is undefined, for example if the user has not accepted the invitation yet
    userId: options.userId ?? Math.random() < 0.5 ? undefined : casual.integer(1, 9999),
  };
}

// Initialize the table
export const initProjectCollaboratorsStore = (count = 10): ProjectCollaborator[] => {
  addMockTableStore<ProjectCollaboratorEntry>('projectCollaborators', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('projectCollaborators', generateNewProjectCollaborators({}));
  }

  return getProjectCollaboratorStore() as ProjectCollaborator[];
}

// Mock the queries
export const mockFindProjectCollaboratorById = async (_: string, __: MyContext, id: number): Promise<ProjectCollaborator | null> => {
  const result = findEntryInMockTableById<ProjectCollaboratorEntry>('projectCollaborators', id);
  return result ? new ProjectCollaborator(result) : null;
};

export const mockFindProjectCollaboratorsByInviterId = async (_: string, __: MyContext, invitedById: number): Promise<ProjectCollaborator[]> => {
  const results = findEntriesInMockTableByFilter<ProjectCollaboratorEntry>(
    'projectCollaborators',
    (entry) => { return entry.invitedById === invitedById }
  );
  return results ? results.map((entry) => { return new ProjectCollaborator(entry) }) : [];
};

export const mockFindProjectCollaboratorsByEmail = async (_: string, __: MyContext, email: string): Promise<ProjectCollaborator[]> => {
  const results = findEntriesInMockTableByFilter<ProjectCollaboratorEntry>(
    'projectCollaborators',
    (entry) => { return entry.email.toLowerCase().trim() === email.toLowerCase().trim() }
  );
  return results ? results.map((entry) => { return new ProjectCollaborator(entry) }) : [];
};

export const mockFindProjectCollaboratorByProjectIdAndEmail = async (
  _: string,
  __: MyContext,
  projectId: number,
  email: string
): Promise<ProjectCollaborator | null> => {
  // NOTE: this previously compared against `entry.templateId` (copy/paste bug) which isn't a
  // field on ProjectCollaborator - fixed to compare against `entry.projectId`, matching the
  // real ProjectCollaborator.findByProjectIdAndEmail behavior this mock stands in for.
  const result = findEntryInMockTableByFilter<ProjectCollaboratorEntry>(
    'projectCollaborators',
    (entry) => {
      return entry.projectId === projectId && entry.email.toLowerCase().trim() === email.toLowerCase().trim()
    }
  );
  return result ? new ProjectCollaborator(result) : null;
};

export const mockFindProjectCollaboratorByProjectId = async (_: string, __: MyContext, projectId: number): Promise<ProjectCollaborator[]> => {
  const results = findEntriesInMockTableByFilter<ProjectCollaboratorEntry>(
    'projectCollaborators',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new ProjectCollaborator(entry) }) : [];
};

// Mock the mutations
export const mockInsertProjectCollaborators = async (context: MyContext, _: string, obj: ProjectCollaborator): Promise<number> => {
  const { insertId } = addEntryToMockTable('projectCollaborators', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateProjectCollaborators = async (context: MyContext, _: string, obj: ProjectCollaborator): Promise<ProjectCollaborator | null> => {
  const result = updateEntryInMockTable('projectCollaborators', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new ProjectCollaborator(result) : null;
};

export const mockDeleteProjectCollaborators = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('projectCollaborators', id);
  return result ? true : false;
};
