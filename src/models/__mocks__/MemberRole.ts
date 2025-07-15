
import casual from "casual";
import { MemberRole } from "../MemberRole";
import { MyContext } from "../../context";
import { isNullOrUndefined } from "../../utils/helpers";

export interface MockMemberRoleOptions {
  displayOrder?: number;
  uri?: string;
  label?: string;
  description?: string;
  isDefault?: boolean;
}

// Generate a mock/test MemberRole
export const mockMemberRole = (
  options: MockMemberRoleOptions
): MemberRole => {
  // Use the options provided or default a value
  return new MemberRole({
    displayOrder: options.displayOrder ?? casual.integer(1, 9999),
    uri: options.uri ?? casual.url,
    label: options.label ?? casual.words(2),
    description: options.description ?? casual.sentence,
    isDefault: options.isDefault ?? false
  });
}

// Save a mock/test MemberRole in the DB for integration tests
export const persistMemberRole = async (
  context: MyContext,
  role: MemberRole
): Promise<MemberRole | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(role.createdById) || isNullOrUndefined(role.modifiedById)) {
    role.createdById = context.token.id;
    role.modifiedById = context.token.id;
  }

  try {
    const created = await role.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting member role ${role.label}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

