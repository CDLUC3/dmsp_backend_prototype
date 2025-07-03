import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import {
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel,
  TemplateCollaborator
} from "../Collaborator";

export interface MockTemplateCollaboratorOptions {
  templateId?: number;
  email?: string;
  invitedById?: number;
  userId?: number;
}

export interface MockProjectCollaboratorOptions {
  projectId?: number;
  email?: string;
  invitedById?: number;
  userId?: number;
  accessLevel?: ProjectCollaboratorAccessLevel;
}

// Generate a mock/test TemplateCollaborator
export const mockTemplateCollaborator = (
  options: MockTemplateCollaboratorOptions
): TemplateCollaborator => {
  // Use the options provided or default a value
  return new TemplateCollaborator({
    templateId: options.templateId ?? casual.integer(1, 9999),
    email: options.email ?? `test.${casual.integer(1, 999)}.${casual.email}`,
    invitedById: options.invitedById ?? casual.integer(1, 9999),
    // Allow the userId to be null its only set when the user has accepted the invitation
    userId: options.userId
  });
}

// Generate a mock/test ProjectCollaborator
export const mockProjectCollaborator = (
  options: MockProjectCollaboratorOptions
): ProjectCollaborator => {
  // Use the options provided or default a value
  return new ProjectCollaborator({
    projectId: options.projectId ?? casual.integer(1, 9999),
    email: options.email ?? `test.${casual.integer(1, 999)}.${casual.email}`,
    invitedById: options.invitedById ?? casual.integer(1, 9999),
    // Allow the userId to be null its only set when the user has accepted the invitation
    userId: options.userId,
    accessLevel: options.accessLevel ?? ProjectCollaboratorAccessLevel.COMMENT
  });
}

// Get the current record count
export const countTemplateCollaborators = async (
  context: MyContext
): Promise<number> => {
  const reference = 'countTemplateCollaborators';
  const sql = `SELECT COUNT(id) AS nbrRecs FROM ${TemplateCollaborator.tableName}`;

  try {
    const results = await TemplateCollaborator.query(context, sql, [], reference);
    return results[0].nbrRecs
  } catch (e) {
    console.error(`Error cleaning fetching record count for TemplateCollaborators: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
  return 0;
}

// Get the current record count
export const countProjectCollaborators = async (
  context: MyContext
): Promise<number> => {
  const reference = 'countProjectCollaborators';
  const sql = `SELECT COUNT(id) AS nbrRecs FROM ${ProjectCollaborator.tableName}`;

  try {
    const results = await ProjectCollaborator.query(context, sql, [], reference);
    return results[0].nbrRecs
  } catch (e) {
    console.error(`Error cleaning fetching record count for ProjectCollaborators: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
  return 0;
}

// Save a mock/test TemplateCollaborator in the DB for integration tests
export const persistTemplateCollaborator = async (
  context: MyContext,
  collaborator: TemplateCollaborator
): Promise<TemplateCollaborator | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(collaborator.createdById) || isNullOrUndefined(collaborator.modifiedById)) {
    collaborator.createdById = context.token.id;
    collaborator.modifiedById = context.token.id;
  }

  try {
    const created = await collaborator.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting template collaborator ${collaborator.email}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

// Save a mock/test ProjectCollaborator in the DB for integration tests
export const persistProjectCollaborator = async (
  context: MyContext,
  collaborator: ProjectCollaborator
): Promise<ProjectCollaborator | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(collaborator.createdById) || isNullOrUndefined(collaborator.modifiedById)) {
    collaborator.createdById = context.token.id;
    collaborator.modifiedById = context.token.id;
  }

  try {
    const created = await collaborator.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting project collaborator ${collaborator.email}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
