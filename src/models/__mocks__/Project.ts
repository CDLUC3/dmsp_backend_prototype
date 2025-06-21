
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

// Clean up all mock/test Project
export const cleanUpAddedProject = async (
  context: MyContext,
  id?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedProjects';
  try {
    // Do a direct delete on the MySQL model because the tests might be mocking the
    // Project functions
    await Project.delete(context, Project.tableName, id, reference);
  } catch (e) {
    console.error(`Error cleaning up plan member id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}

// Fetch a random persisted Project
export const randomProject = async (
  context: MyContext
): Promise<Project | null> => {
  const sql = `SELECT * FROM ${Project.tableName} ORDER BY RAND() LIMIT 1`;
  try {
    const results = await Project.query(context, sql, [], 'randomProject');

    if (Array.isArray(results) && results.length > 0) {
      return new Project(results[0]);
    }
  } catch (e) {
    console.error(`Error getting random Project: ${e.message}`);
  }
  return null;
}
