import { MyContext } from "../context";
import { MemberRole } from "../models/MemberRole";
import {isNullOrUndefined} from "../utils/helpers";
import {PlanMember, ProjectMember} from "../models/Member";
import {Plan} from "../models/Plan";
import {Project} from "../models/Project";
import {
  ProjectCollaboratorAccessLevel
} from "../models/Collaborator";
import {isAdmin, isSuperAdmin} from "./authService";
import {User} from "../models/User";
import {prepareObjectForLogs} from "../logger";

export const hasPermissionOnPlan = async (
  context: MyContext,
  plan: Plan,
  requiredAccessLevel = ProjectCollaboratorAccessLevel.EDIT,
): Promise<boolean> => {
  const reference = 'planService.hasPermissionOnPlan';
  if (!context || !context.token) return false;

  // Super admins always have permission
  if (await isSuperAdmin(context.token)) {
    return true;
  }

  if (plan && plan.id) {
    // See if the plan is listed in the token
    const tokenDMP = context.token.dmpIds.find((entry) => {
      return entry.dmpId === plan.dmpId
    });

    // If the user created the plan then they have access
    if (plan.createdById === context.token.id) {
      return true;
    }

    // If the current user is an Admin and the creator of the plan has the same affiliation
    if (await isAdmin(context.token)) {
      const planCreator = await User.findById(reference, context, plan.createdById);
      if (planCreator && planCreator.affiliationId === context.token.affiliationId) {
        return true;
      }
    }

    // The DMP was not listed on their token then they do not have access
    if (!tokenDMP) {
      return false;
    }

    // Otherwise check to make sure the user has the desired access level
    switch (requiredAccessLevel) {
      case ProjectCollaboratorAccessLevel.COMMENT:
        return true;
      case ProjectCollaboratorAccessLevel.EDIT:
        return tokenDMP.accessLevel === ProjectCollaboratorAccessLevel.OWN ||
          tokenDMP.accessLevel === ProjectCollaboratorAccessLevel.EDIT;
      case ProjectCollaboratorAccessLevel.OWN:
        return tokenDMP.accessLevel === ProjectCollaboratorAccessLevel.OWN;
      default:
        return false;
    }
  }

  const payload = { planId: plan?.id, userId: context.token?.id };
  context.logger.error(prepareObjectForLogs(payload), `AUTH failure: ${reference}`);
  return false;
}

export async function updateMemberRoles(
  reference: string,
  context: MyContext,
  memberId: number,
  currentRoleIds: number[],
  newRoleIds: number[]
): Promise<{ updatedRoleIds: number[], errors: string[] }> {

  const associationErrors = [];
  const { idsToBeRemoved, idsToBeSaved } = MemberRole.reconcileAssociationIds(currentRoleIds, newRoleIds);

  // Remove roles
  const removeErrors = [];
  for (const id of idsToBeRemoved) {
    const role = await MemberRole.findById(reference, context, id);
    if (role) {
      const wasRemoved = await role.removeFromPlanMember(context, memberId);
      if (!wasRemoved) {
        removeErrors.push(role.label);
      }
    }
  }
  if (removeErrors.length > 0) {
    associationErrors.push(`unable to remove roles: ${removeErrors.join(', ')}`);
  }

  // Add roles
  const addErrors = [];
  for (const id of idsToBeSaved) {
    const role = await MemberRole.findById(reference, context, id);
    if (role) {
      const wasAdded = await role.addToPlanMember(context, memberId);
      if (!wasAdded) {
        addErrors.push(role.label);
        // Remove the role from idsToBeSaved if it couldn't be added
        idsToBeSaved.splice(idsToBeSaved.indexOf(id), 1);
      }
    }
  }
  if (addErrors.length > 0) {
    associationErrors.push(`unable to assign roles: ${addErrors.join(', ')}`);
  }

  const updatedRoles = [...currentRoleIds.filter(id => !idsToBeRemoved.includes(id)), ...idsToBeSaved];
  return {
    updatedRoleIds: updatedRoles.length > 0 ? updatedRoles : currentRoleIds,
    errors: associationErrors,
  };
}

// Make sure the plan has a primary contact defined. If not default to the project's
export const ensureDefaultPlanContact = async (
  context: MyContext,
  plan: Plan,
  project: Project
): Promise<boolean> => {
  const reference = 'planService.ensurePlanHasPrimaryContact';

  if (!isNullOrUndefined(plan) && !isNullOrUndefined(project)) {
    const dfltMember = await ProjectMember.findPrimaryContact(reference, context, project.id);
    if (isNullOrUndefined(dfltMember)) {
      return false;
    }
    const dfltMemberRoles = await MemberRole.findByProjectMemberId(
      reference,
      context,
      dfltMember.id,
    );

    const current = await PlanMember.findPrimaryContact(reference, context, plan.id);
    if (isNullOrUndefined(current)) {
      // Create a new member record from the user and set as the primary contact
      const member = new PlanMember({
        planId: plan.id,
        projectMemberId: dfltMember.id,
        isPrimaryContact: true,
        memberRoleIds: dfltMemberRoles.map(role => role.id),
      });

      const created = await member.create(context);
      return !isNullOrUndefined(created) && !created.hasErrors();
    } else {
      // PrimaryContact was already set
      return true;
    }
  }
  return false
}

