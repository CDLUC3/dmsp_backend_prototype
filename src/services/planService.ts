import { MyContext } from "../context";
import { Plan, PlanStatus } from "../models/Plan";
import { ContributorRole } from "../models/ContributorRole";
import { determineIdentifierType, planToDMPCommonStandard } from "./commonStandardService";
import { formatLogMessage } from "../logger";
import { getCurrentDate } from "../utils/helpers";
import { dynamo } from "../datasources/dynamo";

const DEFAULT_TEMPORARY_DMP_ID_PREFIX = 'temp-dmpId-';

// Create the
export const versionDMP = async (context: MyContext, plan: Plan, reference = 'versionDMP'): Promise<Plan> => {
  // Convert the plan to the DMP Common Standard
  const commonStandard = await planToDMPCommonStandard(context, reference, plan);
  formatLogMessage(context).debug({ commonStandard }, `${reference}: Converted plan to DMP Common Standard`);

  if (!plan.dmpId) {
    // If the plan does not have a dmpId then it is new so we need to assign one
    const dmpId = await generateDMPId(context);
    // Assign the new DMP Id
    plan.dmpId = dmpId;
    commonStandard.dmp_id = { identifier: dmpId, type: determineIdentifierType(dmpId) };
    const created = await dynamo.createDMP(plan.dmpId, commonStandard);
    if (!created) {
      plan.addError('general', 'Unable to create a version snapshot of the plan');
    }

  } else if (plan.status === PlanStatus.ARCHIVED) {
    // If the plan is archived then we need to tombstone the existing DMP
    const existingDMP = await dynamo.getDMP(plan.dmpId, 'latest');
    if (Array.isArray(existingDMP) && existingDMP.length > 0) {
      commonStandard.dmp_id = existingDMP[0].dmp_id;
      const tombstoned = await dynamo.tombstoneDMP(plan.dmpId);
      if (!tombstoned) {
        plan.addError('general', 'Unable to create a version snapshot of the plan');
      }
    } else {
      formatLogMessage(context).error({ planId: plan.id }, `${reference}: No existing DMP found for tombstoning`);
      plan.addError('general', 'Unable to tombstone a DMP that does not exist');
    }

  } else {
    // If the plan is not new and not archived then we need to update the existing DMP
    const existingDMP = await dynamo.getDMP(plan.dmpId, 'latest');
    if (Array.isArray(existingDMP) && existingDMP.length > 0) {
      commonStandard.dmp_id = existingDMP[0].dmp_id;
      const updated = await dynamo.updateDMP(commonStandard);
      if (!updated) {
        plan.addError('general', 'Unable to create a version snapshot of the plan');
      }
    } else {
      formatLogMessage(context).error({ planId: plan.id }, `${reference}: No existing DMP found for update`);
      plan.addError('general', 'Unable to update a DMP that does not exist');
    }
  }

  if (plan && !plan.hasErrors()) {
    plan.lastSynced = getCurrentDate();
  }

  return plan;
}

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