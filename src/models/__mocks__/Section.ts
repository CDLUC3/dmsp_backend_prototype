
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import { Section } from "../Section";
import { Tag } from "../Tag";
import { mockTag, persistTag } from "./Tag";

export interface MockSectionOptions {
  templateId: number;
  sourceSectionId?: number;
  name?: string;
  introduction?: string;
  requirements?: string;
  guidance?: string;
  displayOrder?: number;
  bestPractice?: boolean;
  tags?: Tag[];
  isDirty?: boolean;
}

// Generate a mock/test Section
export const mockSection = (
  options: MockSectionOptions
): Section => {
  // Use the options provided or default a value
  return new Section({
    templateId: options.templateId,
    sourceSectionId: options.sourceSectionId,
    name: options.name ?? `${casual.sentence} ${casual.integer(1, 9999)}`,
    introduction: options.introduction ?? casual.sentences(2),
    requirements: options.requirements ?? casual.sentences(2),
    displayOrder: options.displayOrder ?? casual.integer(1, 99),
    bestPractice: options.bestPractice ?? casual.boolean,
    tags: options.tags ?? [mockTag({})],
    isDirty: options.isDirty ?? false
  });
}

// Save a mock/test Section in the DB for integration tests
export const persistSection = async (
  context: MyContext,
  section: Section
): Promise<Section | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(section.createdById) || isNullOrUndefined(section.modifiedById)) {
    section.createdById = context.token.id;
    section.modifiedById = context.token.id;
  }

  try {
    // Save any tags that are associated but have not been persisted!
    await Promise.all(
      section.tags.map(async (tag) => {
        if (isNullOrUndefined(tag.id)) {
          await persistTag(context, new Tag(tag));
        }
      })
    );

    const created = await section.create(context, section.templateId);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting section ${section.name}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
