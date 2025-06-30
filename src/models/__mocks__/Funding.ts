import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import { PlanFunding, ProjectFunding, ProjectFundingStatus } from "../Funding";
import { getRandomEnumValue } from "../../__tests__/helpers";

export interface MockProjectFundingOptions {
  projectId?: number;
  affiliationId?: string;
  status?: number;
  funderOpportunityNumber?: number;
  funderProjectNumber?: number;
  grantId?: string;
}

export interface MockPlanFundingOptions {
  planId?: number;
  projectFundingId?: number;
}

// Generate a mock/test ProjectFunding
export const mockProjectFunding = (
  options: MockProjectFundingOptions
): ProjectFunding => {
  // Use the options provided or default a value
  return new ProjectFunding({
    projectId: options.projectId ?? casual.integer(1, 9999),
    affiliationId: options.affiliationId ?? `${casual.url}/TEST/${casual.integer(1, 9999)}`,
    status: options.status ?? getRandomEnumValue(ProjectFundingStatus),
    funderOpportunityNumber: options.funderOpportunityNumber ?? casual.uuid,
    funderProjectNumber: options.funderProjectNumber ?? casual.uuid,
    grantId: options.grantId ?? casual.url,
  });
}

// Generate a mock/test PlanFunding
export const mockPlanFunding = (
  options: MockPlanFundingOptions
): PlanFunding => {
  // Use the options provided or default a value
  return new PlanFunding({
    planId: options.planId ?? casual.integer(1, 9999),
    projectFundingId: options.projectFundingId ?? casual.integer(1, 9999),
  });
}

// Save a mock/test ProjectFunding in the DB for integration tests
export const persistProjectFunding = async (
  context: MyContext,
  funding: ProjectFunding
): Promise<ProjectFunding | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(funding.createdById) || isNullOrUndefined(funding.modifiedById)) {
    funding.createdById = context.token.id;
    funding.modifiedById = context.token.id;
  }

  try {
    const created = await funding.create(context, funding.projectId);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting project funding ${funding.affiliationId}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

// Save a mock/test PlanFunding in the DB for integration tests
export const persistPlanFunding = async (
  context: MyContext,
  funding: PlanFunding
): Promise<PlanFunding | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(funding.createdById) || isNullOrUndefined(funding.modifiedById)) {
    funding.createdById = context.token.id;
    funding.modifiedById = context.token.id;
  }

  try {
    const created = await funding.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting plan funding ${funding.projectFundingId}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

// Clean up all mock/test ProjectFunding
export const cleanUpAddedProjectFunding = async (
  context: MyContext,
  id?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedProjectFunding';
  if (!isNullOrUndefined(id)) {
    try {
      // Do a direct delete on the MySQL model because the tests might be mocking the
      // ProjectFunding functions
      await ProjectFunding.delete(context, ProjectFunding.tableName, id, reference);
    } catch (e) {
      console.error(`Error cleaning up project funding id ${id}: ${e.message}`);
      if (e.originalError) console.log(e.originalError);
    }
  }
}

// Clean up all mock/test PlanFunding
export const cleanUpAddedPlanFunding = async (
  context: MyContext,
  id?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedPlanFunding';
  try {
    // Do a direct delete on the MySQL model because the tests might be mocking the
    // ProjectFunding functions
    await PlanFunding.delete(context, PlanFunding.tableName, id, reference);
  } catch (e) {
    console.error(`Error cleaning up plan funding id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}
