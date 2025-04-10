import { MyContext } from "../context";
import { ContributorRole } from "../models/ContributorRole";

export async function updateContributorRoles(
  reference: string,
  context: MyContext,
  contributorId: number,
  currentRoleIds: number[],
  newRoleIds: number[]
): Promise<{ updatedRoleIds: number[], errors: string[] }> {

  const associationErrors = [];
  const { idsToBeRemoved, idsToBeSaved } = ContributorRole.reconcileAssociationIds(currentRoleIds, newRoleIds);

  // Remove roles
  const removeErrors = [];
  for (const id of idsToBeRemoved) {
    const role = await ContributorRole.findById(reference, context, id);
    if (role) {
      const wasRemoved = await role.removeFromPlanContributor(context, contributorId);
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
    const role = await ContributorRole.findById(reference, context, id);
    if (role) {
      const wasAdded = await role.addToPlanContributor(context, contributorId);
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
