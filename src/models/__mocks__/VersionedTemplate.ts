
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { VersionedTemplate } from "../VersionedTemplate";
import { MyContext } from "../../context";
import { getMockROR, getRandomEnumValue } from "../../__tests__/helpers";
import { TemplateVersionType } from "../VersionedTemplate";
import { TemplateVisibility } from "../Template";

export interface MockVersionedTemplateOptions {
  templateId?: number;
  version?: string;
  versionedById?: number;
  name?: string;
  description?: string;
  ownerId?: number;
  versionType?: TemplateVersionType;
  comment?: string;
  active?: boolean;
  visibility?: TemplateVisibility;
  bestPractice?: boolean;
  languageId?: string;
}

// Generate a mock/test VersionedTemplate
export const mockVersionedTemplate = (
  options: MockVersionedTemplateOptions
): VersionedTemplate => {
  // Use the options provided or default a value
  return new VersionedTemplate({
    templateId: options.templateId ?? casual.integer(1, 9999),
    version: options.version ?? `v${casual.integer(1, 10)}`,
    versionedById: options.versionedById ?? casual.integer(1, 9999),
    name: options.name ?? `TEST - ${casual.sentence} ${casual.integer(1, 9999)}`,
    description: options.description ?? casual.sentences(2),
    ownerId: options.ownerId ?? getMockROR(),
    versionType: options.versionType ?? getRandomEnumValue(TemplateVersionType),
    comment: options.comment ?? casual.sentence,
    active: options.active ?? casual.boolean,
    visibility: options.visibility ?? getRandomEnumValue(TemplateVisibility),
    bestPractice: options.bestPractice ?? casual.boolean,
    languageId: options.languageId ?? 'en-US',
  });
}

// Save a mock/test VersionedTemplate in the DB for integration tests
export const persistVersionedTemplate = async (
  context: MyContext,
  template: VersionedTemplate
): Promise<VersionedTemplate | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(template.createdById) || isNullOrUndefined(template.modifiedById)) {
    template.createdById = context.token.id;
    template.modifiedById = context.token.id;
  }

  try {
    const created = await template.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting versioned template ${template.name}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}

// Clean up all mock/test VersionedTemplate
export const cleanUpAddedVersionedTemplate = async (
  context: MyContext,
  id?: number,
) : Promise<void> => {
  const reference = 'cleanUpAddedVersionedTemplates';
  try {
    // Do a direct delete on the MySQL model because the tests might be mocking the
    // VersionedTemplate functions
    await VersionedTemplate.delete(context, VersionedTemplate.tableName, id, reference);
  } catch (e) {
    console.error(`Error cleaning up plan member id ${id}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
  }
}

// Fetch a random persisted VersionedTemplate
export const randomVersionedTemplate = async (
  context: MyContext
): Promise<VersionedTemplate | null> => {
  const sql = `SELECT * FROM ${VersionedTemplate.tableName} WHERE active = 1 ORDER BY RAND() LIMIT 1`;
  try {
    const results = await VersionedTemplate.query(context, sql, [], 'randomVersionedTemplate');

    if (Array.isArray(results) && results.length > 0) {
      return new VersionedTemplate(results[0]);
    }
  } catch (e) {
    console.error(`Error getting random VersionedTemplate: ${e.message}`);
  }
  return null;
}
