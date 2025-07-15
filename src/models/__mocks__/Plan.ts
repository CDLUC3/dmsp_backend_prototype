
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { getMockDMPId, getRandomEnumValue } from "../../__tests__/helpers";
import { MyContext } from "../../context";
import { Plan, PlanStatus, PlanVisibility } from "../Plan";
import { supportedLanguages } from "../Language";

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
