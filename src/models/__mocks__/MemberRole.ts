
import casual from "casual";
import { MemberRole } from "../MemberRole";
import {MyContext} from "../../context";

export interface MockMemberRoleOptions {
  displayOrder?: number;
  uri?: string;
  label?: string;
  description?: string;
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
  });
}

// Fetch a random persisted Affiliation
export const randomMemberRole = async (
  context: MyContext
): Promise<MemberRole | null> => {
  const sql = `SELECT * FROM ${MemberRole.tableName} WHERE active = 1 ORDER BY RAND() LIMIT 1`;
  try {
    const results = await MemberRole.query(context, sql, [], 'randomMemberRole');
    if (Array.isArray(results) && results.length > 0) {
      return new MemberRole(results[0]);
    }
  } catch (e) {
    console.error(`Error getting random member role: ${e.message}`);
  }
  return null;
}
