
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
  ownerId?: string;
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
