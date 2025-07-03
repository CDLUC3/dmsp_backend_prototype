
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
