
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { getMockDMPId, getRandomEnumValue } from "../../__tests__/helpers";
import { MyContext } from "../../context";
import {Plan, PlanStatus, PlanVisibility} from "../Plan";
import { supportedLanguages } from "../Language";
import { deleteDMP } from "../../datasources/dynamo";

export interface MockPlanOptions {
  projectId?: number;
  versionedTemplateId?: number;
  status?: PlanStatus;
  visibility?: PlanVisibility;
  dmpId?: string;
  registered?: string;
  registeredById?: number;
  languageId?: number;
  featured?: boolean;
}

// Generate a mock/test Plan
export const mockPlan = (
  options: MockPlanOptions
): Plan => {
  // Use the options provided or default a value
  return new Plan({
    projectId: options.projectId ?? casual.integer(1, 9999),
    versionedTemplateId: options.versionedTemplateId ?? casual.integer(1, 9999),
    status: options.status ?? getRandomEnumValue(PlanStatus),
    visibility: options.visibility ?? getRandomEnumValue(PlanVisibility),
    dmpId: options.dmpId ?? getMockDMPId(),
    registered: options.registered,
    registeredById: options.registeredById,
    languageId: options.languageId ?? supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)].id,
    featured: options.featured ?? casual.boolean,
  });
}

// Save a mock/test Plan in the DB for integration tests
export const persistPlan = async (
  context: MyContext,
  plan: Plan
): Promise<Plan | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(plan.createdById) || isNullOrUndefined(plan.modifiedById)) {
    plan.createdById = context.token.id;
    plan.modifiedById = context.token.id;
  }

  try {
    const created = await plan.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting plan: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

// Clean up all mock/test Plan
export const cleanUpAddedPlan = async (
  context: MyContext,
  id?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedPlans';
  try {
    // Fetch the Plan from the DB
    const plan = await Plan.findById(reference, context, id);

    if (!isNullOrUndefined(plan)) {
      // Do a direct delete on the MySQL model because the tests might be mocking the
      // Plan functions
      await Plan.delete(context, Plan.tableName, plan.id, reference);

      // Delete any Dynamo version records that were persisted
      await deleteDMP(context, plan.dmpId);
    }
  } catch (e) {
    console.error(`Error cleaning up plan id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}

// Clean up all mock/test Plans for the project
export const cleanUpAddedPlans = async (
  context: MyContext,
  projectId?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedPlans';
  try {
    // Fetch the Plan from the DB
    const plans = await Plan.findByProjectId(reference, context, projectId);
    for (const plan of plans) {
      await cleanUpAddedPlan(context, plan.id);
    }
  } catch (e) {
    console.error(`Error cleaning up plans for project id ${projectId}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}
