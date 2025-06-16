
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { UserEmail } from "../UserEmail";
import { MyContext } from "../../context";

// Store for all mock/test Users that were persisted to the DB
const addedUserEmailIds: number[] = [];

export interface MockUserEmailOptions {
  userId: number;
  email: string;
  isPrimary: boolean;
  isConfirmed: boolean;
}

// Generate a mock/test User
export const mockUser = (
  options: Partial<MockUserEmailOptions>
): UserEmail => {
  // Use the options provided or default a value
  return new UserEmail({
    userId: options.userId,
    email: options.email ?? `test.${casual.email}`,
    isPrimary: options.isPrimary ?? false,
    isConfirmed: options.isConfirmed ?? false,
  });
}

// Save a mock/test UserEmail in the DB for integration tests
export const persistUserEmail = async (
  context: MyContext,
  userEmail: UserEmail
): Promise<UserEmail | null> => {
  try {
    const created = await userEmail.create(context);
    if (!isNullOrUndefined(created)) {
      // Keep track of the id so we can clean up afterward
      addedUserEmailIds.push(created.id);
      return created;
    }
    console.error(`Unable to persist user email: ${userEmail.email}`, created?.errors);
  } catch (e) {
    console.error(`Error persisting user email ${userEmail.email}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
  return null;
}

// Clean up all mock/test UserEmails
export const cleanUpAddedUserEmails = async (
  context: MyContext,
) : Promise<void> => {
  const reference = 'cleanUpUserEmails';
  for (const id of addedUserEmailIds) {
    try {
      // Do a direct delete on the MySQL model because the tests might be mocking the UserEmail functions
      await UserEmail.delete(context, UserEmail.tableName, id, reference);
    } catch (e) {
      console.error(`Error cleaning up user email id ${id}: ${e.message}`);
    }
  }
}
