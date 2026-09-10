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
import { getMemberRoleStore, initMemberRoles } from "./MemberRole.js";
import { getMockORCID } from "../../__tests__/helpers.js";
import { MyContext } from "../../context.js";
import { PlanMember, ProjectMember } from "../Member.js";

// The shapes accepted by the real model constructors. These mirror the (unexported)
// options interfaces declared alongside ProjectMember/PlanMember in ../Member.ts.
type ProjectMemberEntry = ConstructorParameters<typeof ProjectMember>[0];
type PlanMemberEntry = ConstructorParameters<typeof PlanMember>[0];

// Project members
// ---------------------------------------------------
export const getProjectMemberStore = (): ProjectMemberEntry[] => {
  return getMockTableStore<ProjectMemberEntry>('projectMembers');
}

export const getRandomProjectMember = (): ProjectMember | null => {
  const store = getMockTableStore<ProjectMemberEntry>('projectMembers');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as ProjectMember;
}

export const clearProjectMemberStore = () => {
  clearMockTableStore('projectMembers');
}

export const generateNewProjectMember = (options: Partial<ProjectMemberEntry>): ProjectMemberEntry => {
  return {
    projectId: options.projectId ?? casual.integer(1, 9999),
    givenName: options.givenName ?? casual.first_name,
    surName: options.surName ?? casual.last_name,
    affiliationId: options.affiliationId ?? casual.url,
    orcid: options.orcid ?? getMockORCID(),
    email: options.email ?? casual.email,
    isPrimaryContact: options.isPrimaryContact ?? false,
  }
}

// Initialize the table
export const initProjectMemberStore = (count = 10): ProjectMember[] => {
  addMockTableStore<ProjectMemberEntry>('projectMembers', []);

  // Since the member has an association with MemberRole, we need to make sure the MemberRole
  // table is initialized first
  const memberRoleStore = getMemberRoleStore();
  if (!memberRoleStore || memberRoleStore.length === 0) {
    initMemberRoles();
  }

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('projectMembers', generateNewProjectMember({}));
  }

  // Cast to ProjectMember[] to match the real model's return shape. The entries are kept as
  // plain data objects (not `new ProjectMember(...)` instances) so that tests mutating the
  // array returned here continue to mutate the same objects backing the mock table store.
  return getProjectMemberStore() as ProjectMember[];
}

// Mock the queries
export const mockFindProjectMemberById = async (_: string, __: MyContext, id: number): Promise<ProjectMember | null> => {
  const result = findEntryInMockTableById<ProjectMemberEntry>('projectMembers', id);
  return result ? new ProjectMember(result) : null;
};

export const mockFindProjectMembersByProjectId = async (_: string, __: MyContext, projectId: number): Promise<ProjectMember[]> => {
  const results = findEntriesInMockTableByFilter<ProjectMemberEntry>(
    'projectMembers',
    (entry) => { return entry.projectId === projectId }
  );
  return results ? results.map((entry) => { return new ProjectMember(entry) }) : [];
};

export const mockFindProjectMembersByAffiliation = async (_: string, __: MyContext, affiliationId: string): Promise<ProjectMember[]> => {
  const results = findEntriesInMockTableByFilter<ProjectMemberEntry>(
    'projectMembers',
    (entry) => { return entry.affiliationId === affiliationId }
  );
  return results ? results.map((entry) => { return new ProjectMember(entry) }) : [];
};

export const mockFindProjectMembersByProjectAndEmail = async (
  _: string,
  __: MyContext,
  projectId: number,
  email: string
): Promise<ProjectMember | null> => {
  const result = findEntryInMockTableByFilter<ProjectMemberEntry>(
    'projectMembers',
    (entry) => { return entry.projectId === projectId && entry.email?.toLowerCase()?.trim() === email.toLowerCase().trim() }
  );
  return result ? new ProjectMember(result) : null;
};

export const mockFindProjectMembersByProjectAndORCID = async (
  _: string,
  __: MyContext,
  projectId: number,
  orcid: string
): Promise<ProjectMember | null> => {
  const result = findEntryInMockTableByFilter<ProjectMemberEntry>(
    'projectMembers',
    (entry) => { return entry.projectId === projectId && entry.orcid?.toLowerCase()?.trim() === orcid.toLowerCase().trim() }
  );
  return result ? new ProjectMember(result) : null;
};

export const mockFindProjectMembersByProjectAndName = async (
  _: string,
  __: MyContext,
  projectId: number,
  givenName: string,
  surName: string
): Promise<ProjectMember | null> => {
  const result = findEntryInMockTableByFilter<ProjectMemberEntry>(
    'projectMembers',
    (entry) => {
      return entry.projectId === projectId &&
        entry.givenName?.toLowerCase()?.trim() === givenName.toLowerCase().trim() &&
        entry.surName?.toLowerCase()?.trim() === surName.toLowerCase().trim();
    }
  );
  return result ? new ProjectMember(result) : null;
};

export const mockFindProjectMembersByProjectAndNameOrORCIDOrEmail = async (
  _: string,
  __: MyContext,
  projectId: number,
  givenName: string,
  surName: string,
  orcid: string,
  email: string
): Promise<ProjectMember | null> => {
  // NOTE: this previously called the plural findEntriesInMockTableByFilter (which returns an
  // array) and then passed the whole array into `new ProjectMember(...)`. Switched to the
  // singular findEntryInMockTableByFilter to match the declared single-result return type and
  // the equivalent real ProjectMember.findByProjectAndNameOrORCIDOrEmail behavior.
  const result = findEntryInMockTableByFilter<ProjectMemberEntry>(
    'projectMembers',
    (entry) => {
      return entry.projectId === projectId &&
        ((entry.givenName?.toLowerCase()?.trim() === givenName.toLowerCase().trim() &&
          entry.surName?.toLowerCase()?.trim() === surName.toLowerCase().trim()) ||
          entry.orcid?.toLowerCase()?.trim() === orcid.toLowerCase().trim() ||
          entry.email?.toLowerCase()?.trim() === email.toLowerCase().trim());
    }
  );
  return result ? new ProjectMember(result) : null;
};

// Mock the mutations
export const mockInsertProjectMember = async (context: MyContext, _: string, obj: ProjectMember): Promise<number> => {
  const { insertId } = addEntryToMockTable('projectMembers', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateProjectMember = async (context: MyContext, _: string, obj: ProjectMember): Promise<ProjectMember | null> => {
  const result = updateEntryInMockTable('projectMembers', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new ProjectMember(result) : null;
};

export const mockDeleteProjectMember = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('projectMembers', id);
  return result ? true : false;
};


// Plan members
// ---------------------------------------------------
export const getPlanMemberStore = (): PlanMemberEntry[] => {
  return getMockTableStore<PlanMemberEntry>('planMembers');
}

export const getRandomPlanMember = (): PlanMember | null => {
  const store = getMockTableStore<PlanMemberEntry>('planMembers');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as PlanMember;
}

export const clearPlanMemberStore = () => {
  clearMockTableStore('planMembers');
}

export const generateNewPlanMember = (options: Partial<PlanMemberEntry>): PlanMemberEntry => {
  return {
    planId: options.planId ?? casual.integer(1, 9999),
    projectMemberId: options.projectMemberId ?? casual.integer(1, 9999),
    isPrimaryContact: options.isPrimaryContact ?? false,
  }
}

// Initialize the table
export const initPlanMemberStore = (count = 10): PlanMember[] => {
  addMockTableStore<PlanMemberEntry>('planMembers', []);

  // Since the member has an association with MemberRole, we need to make sure the MemberRole
  // table is initialized first
  const memberRoleStore = getMemberRoleStore();
  if (!memberRoleStore || memberRoleStore.length === 0) {
    initMemberRoles();
  }

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('planMembers', generateNewPlanMember({}));
  }

  // See the comment in initProjectMemberStore above re: keeping references stable for tests.
  return getPlanMemberStore() as PlanMember[];
}

// Mock the queries
export const mockFindPlanMemberById = async (_: string, __: MyContext, id: number): Promise<PlanMember | null> => {
  const result = findEntryInMockTableById<PlanMemberEntry>('planMembers', id);
  return result ? new PlanMember(result) : null;
};

export const mockFindPlanMembersByProjectMemberId = async (_: string, __: MyContext, projectMemberId: number): Promise<PlanMember[]> => {
  const results = findEntriesInMockTableByFilter<PlanMemberEntry>(
    'planMembers',
    (entry) => { return entry.projectMemberId === projectMemberId }
  );
  return Array.isArray(results) ? results.map((result) => new PlanMember(result)) : [];
};

export const mockFindPlanMembersByPlanId = async (_: string, __: MyContext, planId: number): Promise<PlanMember[]> => {
  const results = findEntriesInMockTableByFilter<PlanMemberEntry>(
    'planMembers',
    (entry) => { return entry.planId === planId }
  );
  return Array.isArray(results) ? results.map((result) => new PlanMember(result)) : [];
};

// Mock the mutations
export const mockInsertPlanMember = async (context: MyContext, _: string, obj: PlanMember): Promise<number> => {
  const { insertId } = addEntryToMockTable('planMembers', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdatePlanMember = async (context: MyContext, _: string, obj: PlanMember): Promise<PlanMember | null> => {
  const result = updateEntryInMockTable('planMembers', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new PlanMember(result) : null;
};

export const mockDeletePlanMember = async (_: MyContext, __: string, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('planMembers', id);
  return result ? true : false;
};
