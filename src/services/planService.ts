import { MyContext } from "../context";
import { PlanVersion } from "../models/PlanVersion";
import { Plan, PlanStatus } from "../models/Plan";
import { planToDMPCommonStandard } from "./commonStandardService";
import { formatLogMessage } from "../logger";
import { DMPCommonStandard } from "../datasources/dmphubAPI";

// Version the plan in the local DB
export const createPlanVersion = async (
  context: MyContext,
  plan: Plan,
  reference = 'createPlanVersion'
): Promise<PlanVersion> => {
  // Convert the plan to the DMP Common Standard
  const commonStandard = await planToDMPCommonStandard(context, reference, plan);
  formatLogMessage(context).debug({ commonStandard }, 'createPlanVersion: Converted plan to DMP Common Standard');

  // Create the new version
  const planVersion = new PlanVersion({ dmp: commonStandard });
  return await planVersion.create(context);
}

// Sync the plan with the DMPHub
export const syncWithDMPHub = async (
  context: MyContext,
  plan: Plan,
  reference = 'syncWithDMPHub'
): Promise<DMPCommonStandard> => {
  // Convert the plan to the DMP Common Standard
  const commonStandard = await planToDMPCommonStandard(context, reference, plan);

  // TODO: Determine the grace period before syncing. We don't want to sync ever time a tiny change is made

  const dmphubAPI = context.dataSources.dmphubAPIDataSource;
  let dmp;

  if (!plan.dmpId) {
    // There is no DMP ID, so we need to create a new DMP
    dmp = await dmphubAPI.createDMP(context, commonStandard, reference);
    formatLogMessage(context).debug({ dmp }, 'syncWithDMPHub: Created DMP in DMPHub');

  } else if (plan.status === PlanStatus.ARCHIVED) {
    // The plan is archived, so we need to tombstone the DMP
    dmp = await dmphubAPI.tombstoneDMP(context, commonStandard, reference);
    formatLogMessage(context).debug({ dmp }, 'syncWithDMPHub: Tombstoned DMP in DMPHub');

  } else {
    // Otherwise we are just doing an update
    dmp = await dmphubAPI.updateDMP(context, commonStandard, reference);
    formatLogMessage(context).debug({ dmp }, 'syncWithDMPHub: Updated DMP in DMPHub');
  }

  // Update the plan's sync and registered date (if applicable) and using `noTouch` so the created/modified
  // aren't impacted
  plan.lastSynced = new Date().toISOString();
  if (plan.status === PlanStatus.PUBLISHED) {
    plan.registered = new Date().toISOString();
  }
  await plan.update(context, true);

  return dmp;
}
