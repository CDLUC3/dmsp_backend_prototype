import { MyContext } from "../context";
import { MemberRole } from "../models/MemberRole";
import { isNullOrUndefined } from "../utils/helpers";
import { PlanMember, ProjectMember } from "../models/Member";
import { Plan } from "../models/Plan";
import { Project } from "../models/Project";

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
      if (!isNullOrUndefined(created) && !created.hasErrors()) {
        // Add the roles to the default plan member
        for (const role of dfltMemberRoles) {
          await role.addToPlanMember(context, created.id);
        }
        return true;
      }
      return false;
    } else {
      // PrimaryContact was already set
      return true;
    }
  }
  return false
}

