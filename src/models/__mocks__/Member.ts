import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { randomMemberRole } from "./MemberRole";
import { getMockORCID } from "../../__tests__/helpers";
import { MyContext } from "../../context";
import { PlanMember, ProjectMember } from "../Member";
import {MemberRole} from "../MemberRole";

// NOTE: associations to memberRoles will be deleted automatically when cleanup
// is called on these records due to cascading deletes enforced by the DB.

export interface MockProjectMemberOptions {
  projectId?: number;
  givenName?: string;
  surName?: string;
  affiliationId?: string;
  orcid?: string;
  email?: string;
  memberRoles?: number[];
}
export interface MockPlanMemberOptions {
  planId?: number;
  projectMemberId?: number;
  memberRoleIds?: number[];
  isPrimaryContact?: boolean;
}

// Generate a mock/test ProjectMember
export const mockProjectMember = async (
  context: MyContext,
  options: MockProjectMemberOptions
): Promise<ProjectMember> => {
  const randoRole = await randomMemberRole(context);
  // Use the options provided or default a value
  return new ProjectMember({
    projectId: options.projectId ?? casual.integer(1, 9999),
    givenName: options.givenName ?? casual.first_name,
    surName: options.surName ?? casual.last_name,
    affiliationId: options.affiliationId ?? casual.url,
    orcid: options.orcid ?? getMockORCID(),
    email: options.email ?? `test.${casual.integer(1, 999)}.${casual.email}`,
    memberRoles: options.memberRoles ?? [randoRole.id],
  });
}

// Generate a mock/test PlanMember
export const mockPlanMember = async (
  context: MyContext,
  options: MockPlanMemberOptions
): Promise<PlanMember> => {
  const randoRole = await randomMemberRole(context);
  // Use the options provided or default a value
  return new PlanMember({
    planId: options.planId ?? casual.integer(1, 9999),
    projectMemberId: options.projectMemberId ?? casual.integer(1, 9999),
    memberRoleIds: options.memberRoleIds ?? [randoRole.id],
    isPrimaryContact: options.isPrimaryContact ?? false,
  });
}

// Save a mock/test ProjectMember in the DB for integration tests
export const persistProjectMember = async (
  context: MyContext,
  member: ProjectMember
): Promise<ProjectMember | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(member.createdById) || isNullOrUndefined(member.modifiedById)) {
    member.createdById = context.token.id;
    member.modifiedById = context.token.id;
  }

  try {
    const created = await member.create(context, member.projectId);

    // Attachment of the roles to the member currently happens in the resolver
    // so we need to do it manually here
    if (!isNullOrUndefined(created)) {
      for (const role of member.memberRoles) {
        const memberRole = await MemberRole.findById(
          'persistProjectMember',
          context,
          role.id
        );

        if (!isNullOrUndefined(memberRole)) {
          await memberRole.addToProjectMember(context, created.id);
        }
      }
    }
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting project member ${member.email}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

// Save a mock/test PlanMember in the DB for integration tests
export const persistPlanMember = async (
  context: MyContext,
  member: PlanMember
): Promise<PlanMember | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(member.createdById) || isNullOrUndefined(member.modifiedById)) {
    member.createdById = context.token.id;
    member.modifiedById = context.token.id;
  }

  try {
    const created = await member.create(context);

    // Attachment of the roles to the member currently happens in the resolver
    // so we need to do it manually here
    if (!isNullOrUndefined(created)) {
      for (const roleId of member.memberRoleIds) {
        const memberRole = await MemberRole.findById(
          'persistPlanMember',
          context,
          roleId
        );

        if (!isNullOrUndefined(memberRole)) {
          await memberRole.addToPlanMember(context, created.id);
        }
      }
    }

    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting plan member ${member.projectMemberId}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

// Clean up all mock/test ProjectMember
export const cleanUpAddedProjectMember = async (
  context: MyContext,
  id?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedProjectMember';
  try {
    // Do a direct delete on the MySQL model because the tests might be mocking the
    // ProjectMember functions
    await ProjectMember.delete(context, ProjectMember.tableName, id, reference);
  } catch (e) {
    console.error(`Error cleaning up project member id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}

// Clean up all mock/test PlanMember
export const cleanUpAddedPlanMember = async (
  context: MyContext,
  id?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedPlanMember';
  try {
    // Do a direct delete on the MySQL model because the tests might be mocking the
    // ProjectMember functions
    await PlanMember.delete(context, PlanMember.tableName, id, reference);
  } catch (e) {
    console.error(`Error cleaning up plan member id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}
