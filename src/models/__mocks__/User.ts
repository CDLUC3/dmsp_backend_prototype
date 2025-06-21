
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { User, UserRole } from "../User";
import { MyContext } from "../../context";
import { getMockROR, getRandomEnumValue } from "../../__tests__/helpers";
import {UserEmail} from "../UserEmail";

export interface MockUserOptions {
  id?: number;
  email?: string;
  password?: string;
  givenName?: string;
  surName?: string;
  affiliationId?: string;
  role?: UserRole;
  languageId?: string;
  orcid?: string;
  acceptedTerms?: boolean;
}

// Generate a mock/test User
export const mockUser = (
  options: Partial<MockUserOptions>
): User => {
  // Use the options provided or default a value
  return new User({
    id: options.id,
    email: options.email ?? `test.${casual.integer(1, 999)}.${casual.email}`,
    password: options.password ?? 'Testing123$9',
    role: options.role ?? getRandomEnumValue(UserRole),
    givenName: options.givenName ?? casual.first_name,
    surName: options.surName ?? casual.last_name,
    affiliationId: options.affiliationId ?? getMockROR(),
    acceptedTerms: options.acceptedTerms ?? true,
  });
}

// Save a mock/test User in the DB for integration tests
export const persistUser = async (
  context: MyContext,
  user: User
): Promise<User | null> => {
  try {
    const created = await user.register(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting user ${user.email}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
  return null;
}

// Clean up all mock/test Users
export const cleanUpAddedUser = async (
  context: MyContext,
  id?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedUsers';
  try {
    // User auto-creates UserEmail records so we need to delete those first
    const userEmails = await UserEmail.findByUserId(reference, context, id);
    for (const userEmail of userEmails) {
      await userEmail.delete(context);
    }

    // Do a direct delete on the MySQL model because the tests might be mocking the User functions
    await User.delete(context, User.tableName, id, reference);
  } catch (e) {
    console.error(`Error cleaning up affiliation id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}

// Fetch a random persisted User
export const randomUser = async (
  context: MyContext
): Promise<User | null> => {
  const sql = `SELECT * FROM ${User.tableName} WHERE active = 1 ORDER BY RAND() LIMIT 1`;
  try {
    const results = await User.query(context, sql, [], 'randomUser');
    if (Array.isArray(results) && results.length > 0) {
      return new User(results[0]);
    }
  } catch (e) {
    console.error(`Error getting random user: ${e.message}`);
  }
  return null;
}
