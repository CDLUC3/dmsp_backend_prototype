
import casual from "casual";
import { getCurrentDate } from "../../utils/helpers.js";
import { addEntryToMockTable, addMockTableStore, clearMockTableStore, deleteEntryFromMockTable, findEntriesInMockTableByFilter, findEntryInMockTableByFilter, findEntryInMockTableById, getMockTableStore, updateEntryInMockTable } from "./MockStore.js";
import { MemberRole } from "../MemberRole.js";
import { MyContext } from "../../context.js";

// The shape accepted by the real MemberRole constructor.
type MemberRoleEntry = ConstructorParameters<typeof MemberRole>[0];

// Join table row shapes for the many-to-many associations between MemberRole and
// ProjectMember/PlanMember.
interface ProjectMemberRoleJoinEntry {
  id?: number;
  created?: string;
  createdById?: number;
  modified?: string;
  modifiedById?: number;
  memberRoleId: number;
  projectMemberId: number;
}

interface PlanMemberRoleJoinEntry {
  id?: number;
  created?: string;
  createdById?: number;
  modified?: string;
  modifiedById?: number;
  memberRoleId: number;
  planMemberId: number;
}

export const getMemberRoleStore = (): MemberRoleEntry[] => {
  return getMockTableStore<MemberRoleEntry>('memberRoles');
}

export const getRandomMemberRole = (): MemberRole | null => {
  const store = getMockTableStore<MemberRoleEntry>('memberRoles');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)] as MemberRole;
}

// Initialize the table
export const initMemberRoles = (count = 10): MemberRole[] => {
  addMockTableStore<MemberRoleEntry>('memberRoles', []);

  // Add related join tables
  addMockTableStore<ProjectMemberRoleJoinEntry>('projectMemberRoles', []);
  addMockTableStore<PlanMemberRoleJoinEntry>('planMemberRoles', []);

  for (let i = 0; i < count; i++) {
    const tstamp = getCurrentDate();

    addEntryToMockTable('memberRoles', {
      id: casual.integer(1, 9999),
      createdById: casual.integer(1, 999),
      created: tstamp,
      modifiedById: casual.integer(1, 999),
      modified: tstamp,
      displayOrder: i,
      uri: casual.url,
      label: casual.words(2),
      description: casual.sentence,
    });
  }

  // Cast to MemberRole[] to match the real model's return shape. The entries are kept as
  // plain data objects (not `new MemberRole(...)` instances) so that tests mutating the
  // array returned here continue to mutate the same objects backing the mock table store.
  return getMemberRoleStore() as MemberRole[];
}

export const clearMemberRoles = () => {
  clearMockTableStore('memberRoles');

  // clear related join tables
  clearMockTableStore('projectMemberRoles');
  clearMockTableStore('planMemberRoles');
}

// Mock the queries
export const mockFindMemberRoleById = async (_: unknown, __: unknown, id: number): Promise<MemberRoleEntry | undefined> => {
  return findEntryInMockTableById<MemberRoleEntry>('memberRoles', id);
};

export const mockFindMemberRoleByURL = async (_: unknown, __: unknown, uri: string): Promise<MemberRoleEntry | undefined> => {
  return findEntryInMockTableByFilter<MemberRoleEntry>(
    'memberRoles',
    (entry) => { return entry.uri.toLowerCase().trim() === uri.toLowerCase().trim() }
  );
};

export const mockFindByProjectMemberId = async (_: unknown, __: unknown, projectMemberId: number): Promise<MemberRole[]> => {
  const results = findEntriesInMockTableByFilter<ProjectMemberRoleJoinEntry>(
    'projectMemberRoles',
    (entry) => { return entry.projectMemberId === projectMemberId }
  );

  if (Array.isArray(results)) {
    const roles = await Promise.all(results.map(async (result) =>
      await mockFindMemberRoleById(null, null, result.memberRoleId)
    ));
    // Non-null assertion preserves the original behavior of assuming every join-table row
    // has a matching memberRoles entry (constructing `new MemberRole(undefined)` would have
    // thrown previously too, just without a compile-time signal).
    return roles.map((role) => new MemberRole(role!));
  }
  return [];
};

export const mockFindByPlanMemberId = async (_: unknown, __: unknown, planMemberId: number): Promise<MemberRole[]> => {
  const results = findEntriesInMockTableByFilter<PlanMemberRoleJoinEntry>(
    'planMemberRoles',
    (entry) => { return entry.planMemberId === planMemberId }
  );
  if (Array.isArray(results)) {
    const roles = await Promise.all(results.map(async (result) =>
      await mockFindMemberRoleById(null, null, result.memberRoleId)
    ));
    return roles.map((role) => new MemberRole(role!));
  }
  return [];
};

export const mockDefaultMemberRole = async (): Promise<MemberRole | null> => {
  const store = getMemberRoleStore();
  return Array.isArray(store) && store.length > 0 ? (store[0] as MemberRole) : null;
};

// Mock the mutations
export const mockInsertMemberRole = async (context: MyContext, _: unknown, obj: MemberRole): Promise<{ insertId: number }> => {
  // NOTE: `obj` is spread first so the createdById/created/modifiedById/modified defaults
  // below actually take effect - previously they were spread over by `...obj` afterward
  // (which TS now flags as a no-op duplicate-property assignment), matching the
  // insert-mutation pattern used by the other mock files (e.g. Member.ts, Funder.ts).
  return addEntryToMockTable('memberRoles', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
};

export const mockUpdateMemberRole = async (context: MyContext, _: unknown, obj: MemberRole): Promise<MemberRoleEntry | null> => {
  return updateEntryInMockTable('memberRoles', {
    modifiedById: context.token.id,
    modified: getCurrentDate(),
    ...obj
  });
};

export const mockDeleteMemberRole = async (_: unknown, __: unknown, id: number): Promise<boolean> => {
  return deleteEntryFromMockTable('memberRoles', id);
};

export const mockAddMemberRoleToProjectMember = async (
  context: MyContext,
  memberRoleId: number,
  projectMemberId: number
): Promise<boolean> => {
  const memberRole = findEntryInMockTableById<MemberRoleEntry>('memberRoles', memberRoleId);
  if (!memberRole) {
    return false; // Member role not found
  }

  const projectMemberRolesStore = getMockTableStore<ProjectMemberRoleJoinEntry>('projectMemberRoles');
  if (!projectMemberRolesStore) {
    return false; // Project member roles store not found
  }

  const newEntry = {
    memberRoleId,
    projectMemberId,
    createdById: context.token.id,
    modifiedById: context.token.id,
    created: getCurrentDate(),
    modified: getCurrentDate(),
  };

  projectMemberRolesStore.push(newEntry);
  return true; // Successfully added
};

export const mockRemoveMemberRoleFromProjectMember = async (
  _: unknown,
  memberRoleId: number,
  projectMemberId: number
): Promise<boolean> => {
  const projectMemberRolesStore = getMockTableStore<ProjectMemberRoleJoinEntry>('projectMemberRoles');
  if (!projectMemberRolesStore) {
    return false; // Project member roles store not found
  }

  const indexToRemove = projectMemberRolesStore.findIndex(entry =>
    entry.memberRoleId === memberRoleId && entry.projectMemberId === projectMemberId
  );

  if (indexToRemove === -1) {
    return false; // Entry not found
  }

  projectMemberRolesStore.splice(indexToRemove, 1);
  return true; // Successfully removed
};

export const mockAddMemberRoleToPlanMember = async (
  context: MyContext,
  memberRoleId: number,
  planMemberId: number
): Promise<boolean> => {
  const memberRole = findEntryInMockTableById<MemberRoleEntry>('memberRoles', memberRoleId);
  if (!memberRole) {
    return false; // member role not found
  }

  const planMemberRolesStore = getMockTableStore<PlanMemberRoleJoinEntry>('planMemberRoles');
  if (!planMemberRolesStore) {
    return false; // Plan member roles store not found
  }

  const newEntry = {
    memberRoleId,
    planMemberId,
    createdById: context.token.id,
    modifiedById: context.token.id,
    created: getCurrentDate(),
    modified: getCurrentDate(),
  };

  planMemberRolesStore.push(newEntry);
  return true; // Successfully added
};

export const mockRemoveMemberRoleFromPlanMember = async (
  _: unknown,
  memberRoleId: number,
  planMemberId: number
): Promise<boolean> => {
  const planMemberRolesStore = getMockTableStore<PlanMemberRoleJoinEntry>('planMemberRoles');
  if (!planMemberRolesStore) {
    return false; // Plan member roles store not found
  }

  const indexToRemove = planMemberRolesStore.findIndex(entry =>
    entry.memberRoleId === memberRoleId && entry.planMemberId === planMemberId
  );

  if (indexToRemove === -1) {
    return false; // Entry not found
  }

  planMemberRolesStore.splice(indexToRemove, 1);
  return true; // Successfully removed
};
