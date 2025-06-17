
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
import { User, UserRole } from "../User";
import { MyContext } from "../../context";
import { getMockORCID, getMockROR, getRandomEnumValue } from "../../__tests__/helpers";

export const getUserStore = () => {
  return getMockTableStore('users');
}

export const getRandomUser = (): User => {
  const store = getMockTableStore('users');
  if (!store || store.length === 0) {
    return null;
  }
  return store[Math.floor(Math.random() * store.length)];
}

export const clearUserStore = () => {
  clearMockTableStore('users');
}

export const generateNewUser = (options) => {
  return {
    email: options.email ?? casual.email,
    password: options.password ?? casual.password,
    role: options.role ?? getRandomEnumValue(UserRole),
    givenName: options.givenName ?? casual.first_name,
    surName: options.surName ?? casual.last_name,
    affiliationId: options.affiliationId ?? getMockROR(),
    acceptedTerms: options.acceptedTerms ?? casual.boolean,
    orcid: options.orcid ?? getMockORCID(),
    ssoId: options.ssoId ?? casual.uuid,
    languageId: options.languageId ?? 'en-US',

    last_sign_in: options.last_sign_in ?? casual.date('YYYY-MM-DDTHH:mm:ss.SSSZ'),
    last_sign_in_via: options.last_sign_in_via ?? getRandomEnumValue(['email', 'sso']),
    failed_sign_in_attempts: options.failed_sign_in_attempts ?? 0,

    notify_on_comment_added: options.notify_on_comment_added ?? true,
    notify_on_template_shared: options.notify_on_template_shared ?? true,
    notify_on_feedback_complete: options.notify_on_feedback_complete ?? true,
    notify_on_plan_shared: options.notify_on_plan_shared ?? true,
    notify_on_plan_visibility_change: options.notify_on_plan_visibility_change ?? true,
    locked: options.locked ?? false,
    active: options.active ?? true,
  }
}

// Initialize the table
export const initUserStore = (count = 10): User[] => {
  addMockTableStore('users', []);

  for (let i = 0; i < count; i++) {
    addEntryToMockTable('users', generateNewUser({}));
  }

  return getUserStore();
}

// Mock the queries
export const mockFindUserById = async (_, __, id: number): Promise<User> => {
  const result = findEntryInMockTableById('users', id);
  return result ? new User(result) : null;
};

export const mockFindUserByEmail = async (_, __, email: string): Promise<User> => {
  const result = findEntryInMockTableByFilter(
    'users',
    (entry) => { return entry.email.toLowerCase().trim() === email.toLowerCase().trim() }
  );
  return result ? new User(result) : null;
};

export const mockFindUsersByAffiliationId = async (_, __, affiliationId: string): Promise<User[]> => {
  // Filter the users based on the search term
  const results = findEntriesInMockTableByFilter(
    'users',
    (entry) => { return entry.affiliationId === affiliationId }
  );
  return results ? results.map((entry) => { return new User(entry) }) : [];
};

// Mock the mutations
export const mockInsertUser = async (context: MyContext, _, obj: User): Promise<number> => {
  const { insertId } = addEntryToMockTable('users', {
    ...obj,
    createdById: context.token.id,
    created: getCurrentDate(),
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return insertId;
};

export const mockUpdateUser = async (context: MyContext, _, obj: User): Promise<User> => {
  const result = updateEntryInMockTable('users', {
    ...obj,
    modifiedById: context.token.id,
    modified: getCurrentDate(),
  });
  return result ? new User(result) : null;
};

export const mockDeleteUser = async (_, __, id: number): Promise<boolean> => {
  const result = deleteEntryFromMockTable('users', id);
  return result ? true : false;
};
