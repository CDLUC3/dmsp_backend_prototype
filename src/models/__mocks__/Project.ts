
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { Project } from "../Project";
import { MyContext } from "../../context";

export interface MockProjectOptions {
  title?: string;
  abstractText?: string;
  startDate?: string;
  endDate?: string;
  researchDomainId?: number;
  isTestProject?: boolean;
}

// Generate a mock/test Project
export const mockProject = (
  options: MockProjectOptions
): Project => {
  // Use the options provided or default a value
  return new Project({
    title: options.title ?? `TEST - ${casual.sentence} ${casual.integer(1, 9999)}`,
    abstractText: options.abstractText ?? casual.sentences(4),
    startDate: options.startDate ?? '2024-12-13',
    endDate: options.endDate ?? '2026-01-21',
    researchDomainId: options.researchDomainId ?? casual.integer(1, 99),
    isTestProject: options.isTestProject ?? casual.boolean,
  });
}

// Save a mock/test Project in the DB for integration tests
export const persistProject = async (
  context: MyContext,
  project: Project
): Promise<Project | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(project.createdById) || isNullOrUndefined(project.modifiedById)) {
    project.createdById = context.token.id;
    project.modifiedById = context.token.id;
  }

  try {
    const created = await project.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting project ${project.title}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
