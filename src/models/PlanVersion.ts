
import { generalConfig } from "../config/generalConfig";
import { MyContext } from "../context";
import { createDMP, deleteDMP, dynamoEnabled, getDMP, tombstoneDMP, updateDMP } from "../datasources/dynamo";
import { formatLogMessage } from "../logger";
import { planToDMPCommonStandard } from "../services/commonStandardService";
import { DMPCommonStandard } from "../types/DMP";
import { Plan } from "./Plan";

// Create a new PlanVersion
export const addVersion = async (
  context: MyContext,
  plan: Plan,
  reference = 'PlanVersion.addVersion'
): Promise<Plan> => {
  // If the DynamoDB is not enabled (e.g. working locally) then just return the plan as-is
  if (!dynamoEnabled) return plan;

  const commonStandard = await planToDMPCommonStandard(context, reference, plan);
  if (!commonStandard) {
    plan.addError('general', 'Unable to convert the plan to the DMP Common Standard');
    return plan;
  }

  formatLogMessage(context).debug(commonStandard, `${reference} - creating Plan Version`);
  const newPlanVersion = await createDMP(context, plan.dmpId, commonStandard);
  if (!newPlanVersion) {
    formatLogMessage(context).error({ plan }, `${reference} - Unable to create a new version snapshot`);
    plan.addError('general', 'Unable to create a new version snapshot');
  }
  return plan;
}

// Update the latest version of the Plan
export const updateVersion = async (
  context: MyContext,
  plan: Plan,
  reference = 'PlanVersion.updateVersion'
): Promise<Plan> => {
  // If the DynamoDB is not enabled (e.g. working locally) then just return the plan as-is
  if (!dynamoEnabled) return plan;

  const commonStandard = await planToDMPCommonStandard(context, reference, plan);
  if (!commonStandard) {
    plan.addError('general', 'Unable to convert the plan to the DMP Common Standard');
    return plan;
  }

  // If the lastModified date is not within the last hour, create a new version snapshot
  const mostRecentVersion = await latestVersion(context, plan.id, plan.dmpId, reference);
  if (mostRecentVersion) {
    const lastModified = new Date(mostRecentVersion?.modified);
    const now = new Date();
    // Calculate the difference in hours between the lastModified and now
    const diff = Math.abs(now.getTime() - lastModified.getTime()) / 36e5;

    // If the change happened more than one hour since the lastSync date then generate a version snapshot
    if (diff >= generalConfig.versionPlanAfter) {
      const msg = `Plan last changed over ${generalConfig.versionPlanAfter} hour(s) ago, so creating a new version`;
      formatLogMessage(context).debug({ planId: plan.id}, msg);
      return addVersion(context, plan, reference);

    } else {
      formatLogMessage(context).debug(commonStandard, `${reference} - updating Plan Version`);
      const updatedVersion = await updateDMP(context, commonStandard);
      if (!updatedVersion) {
        formatLogMessage(context).error({ plan }, `${reference} - Unable to update the latest version`);
        plan.addError('general', 'Unable to update the version snapshot');
      }
    }
  } else {
    plan.addError('general', 'Unable to find the latest version of the DMP');
  }
  return plan;
}

// Delete/Tombstone the specified Plan Version (registered/published DMPs can only be Tombstoned!)
export const removeVersions = async (
  context: MyContext,
  plan: Plan,
  reference = 'PlanVersion.removeVersion'
): Promise<Plan> => {
  // If the DynamoDB is not enabled (e.g. working locally) then just return the plan as-is
  if (!dynamoEnabled) return plan;

  // Get the latest version and see if it is registered
  const mostRecentVersion = await latestVersion(context, plan.id, plan.dmpId, reference);
  // If the plan is registered then tombstone the DMP otherwise delete it
  if (mostRecentVersion?.registered) {
    formatLogMessage(context).debug({ dmpId: plan.dmpId }, `${reference} - tombstoning the DMP`);
    const tombstoned = await tombstoneDMP(context, plan.dmpId);
    if (!tombstoned) {
      plan.addError('general', 'Unable to tombstone the DMP');
    }
  } else {
    formatLogMessage(context).debug({ dmpId: plan.dmpId }, `${reference} - deleting all versions of the DMP`);
    await deleteDMP(context, plan.dmpId);
  }
  return plan;
}

// Find all of the versions for a specific plan
export const findVersionsByDMPId = async (
  context: MyContext,
  dmpId: string,
  reference = 'PlanVersion.findVersionsByDMPId'
): Promise<DMPCommonStandard[] | []> => {
  // If the DynamoDB is not enabled (e.g. working locally) then just return an empty array
  if (!dynamoEnabled) return [];

  formatLogMessage(context).debug({ dmpId }, `${reference} - retrieving the versions of the DMP`);
  const dmps = await getDMP(context, dmpId, null);
  return Array.isArray(dmps) && dmps.length > 0 ? dmps : [];
}

// Find a specific version of the plan
export const findVersionByTimestamp = async (
  context: MyContext,
  dmpId: string,
  versionTimestamp: string,
  reference = 'PlanVersion.findVersionByTimestamp'
): Promise<DMPCommonStandard | null> => {
  // If the DynamoDB is not enabled (e.g. working locally) then just return null
  if (!dynamoEnabled) return null;

  formatLogMessage(context).debug({ dmpId, versionTimestamp }, `${reference} - retrieving the version of the DMP`);
  const dmps = await getDMP(context, dmpId, versionTimestamp);
  return Array.isArray(dmps) && dmps.length > 0 ? dmps[0] : null;
}

// Retrieve the latest version of the plan
export const latestVersion = async (
  context: MyContext,
  planId: number,
  dmpId: string,
  reference = 'PlanVersion.latestVersion'
): Promise<DMPCommonStandard | null> => {
  // If the DynamoDB is not enabled (e.g. working locally) then just return null
  if (!dynamoEnabled) return null;

  formatLogMessage(context).debug({ planId, dmpId }, `${reference} - retrieving the latest version of the DMP`);
  let dmps = await getDMP(context, `https://${generalConfig.domain}/dmps/${planId}`, null);

  if (!Array.isArray(dmps) || dmps.length === 0) {
    dmps = await getDMP(context, dmpId, null);
  }
  return Array.isArray(dmps) && dmps.length > 0 ? dmps[0] : null;
}
