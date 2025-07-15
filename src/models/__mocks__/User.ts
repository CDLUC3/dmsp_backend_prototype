
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { User, UserRole } from "../User";
import { MyContext } from "../../context";
import { getRandomEnumValue } from "../../__tests__/helpers";
import {addUserForTeardown} from "../../resolvers/__tests__/resolverTestHelper";

export interface MockUserOptions {
  id?: number;
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
    password: options.password ?? 'Testing123$9',
    role: options.role ?? getRandomEnumValue(UserRole),
    givenName: options.givenName ?? casual.first_name,
    surName: options.surName ?? casual.last_name,
    affiliationId: options.affiliationId,
    acceptedTerms: options.acceptedTerms ?? true,
  });
}

// Save a mock/test User in the DB for integration tests
export const persistUser = async (
  context: MyContext,
  user: User,
  email: string = casual.email,
): Promise<User | null> => {
  try {
    const created = await user.register(context, email);
    addUserForTeardown(created.id.toString());
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting user ${email}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
  return null;
}
