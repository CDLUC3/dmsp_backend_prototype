
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { UserEmail } from "../UserEmail";
import { MyContext } from "../../context";

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
    email: options.email ?? `test.${casual.integer(1, 999)}.${casual.email}`,
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
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting user email ${userEmail.email}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
