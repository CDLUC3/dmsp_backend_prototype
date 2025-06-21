
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import { getMockROR, getRandomEnumValue } from "../../__tests__/helpers";
import { Template, TemplateVisibility } from "../Template";

export interface MockTemplateOptions {
  sourceTemplateId?: number;
  name?: string;
  description?: string;
  ownerId?: string;
  visibility?: TemplateVisibility;
  latestPublishVersion?: string;
  latestPublishDate?: string;
  bestPractice?: boolean;
  languageId?: string;
}

// Generate a mock/test Template
export const mockTemplate = (
  options: MockTemplateOptions
): Template => {
  // Use the options provided or default a value
  return new Template({
    sourceTemplateId: options.sourceTemplateId,
    name: options.name ?? `TEST - ${casual.sentence} ${casual.integer(1, 9999)}`,
    description: options.description ?? casual.sentences(2),
    ownerId: options.ownerId ?? getMockROR(),
    visibility: options.visibility ?? getRandomEnumValue(TemplateVisibility),
    latestPublishVersion: options.latestPublishVersion,
    latestPublishDate: options.latestPublishDate,
    bestPractice: options.bestPractice ?? casual.boolean,
    languageId: options.languageId ?? 'en-US',
  });
}

// Save a mock/test Template in the DB for integration tests
export const persistTemplate = async (
  context: MyContext,
  template: Template
): Promise<Template | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(template.createdById) || isNullOrUndefined(template.modifiedById)) {
    template.createdById = context.token.id;
    template.modifiedById = context.token.id;
  }

  try {
    const created = await template.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting template ${template.name}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

// Clean up all mock/test Template
export const cleanUpAddedTemplate = async (
  context: MyContext,
  id: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedTemplates';
  try {
    // Do a direct delete on the MySQL model because the tests might be mocking the
    // Template functions
    await Template.delete(context, Template.tableName, id, reference);
  } catch (e) {
    console.error(`Error cleaning up plan member id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}

// Fetch a random persisted Template
export const randomTemplate = async (
  context: MyContext
): Promise<Template | null> => {
  const sql = `SELECT * FROM ${Template.tableName} ORDER BY RAND() LIMIT 1`;
  try {
    const results = await Template.query(context, sql, [], 'randomTemplate');

    if (Array.isArray(results) && results.length > 0) {
      return new Template(results[0]);
    }
  } catch (e) {
    console.error(`Error getting random Template: ${e.message}`);
  }
  return null;
}
