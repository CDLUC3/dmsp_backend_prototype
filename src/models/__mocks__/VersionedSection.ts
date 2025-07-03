
import casual from "casual";
import { isNullOrUndefined } from "../../utils/helpers";
import { MyContext } from "../../context";
import { Tag } from "../Tag";
import { VersionedSection } from "../VersionedSection";

export interface MockVersionedSectionOptions {
  versionedTemplateId: number;
  sectionId: number;
  name?: string;
  introduction?: string;
  requirements?: string;
  guidance?: string;
  displayOrder: number;
  bestPractice?: boolean;
  tags?: Tag[];
}

// Generate a mock/test VersionedSection
export const mockVersionedSection = (
  options: MockVersionedSectionOptions
): VersionedSection => {
  // Use the options provided or default a value
  return new VersionedSection({
    versionedTemplateId: options.versionedTemplateId,
    sectionId: options.sectionId,
    name: options.name,
    introduction: options.introduction,
    requirements: options.requirements,
    displayOrder: options.displayOrder,
    bestPractice: options.bestPractice,
    tags: options.tags,
  });
}

// Save a mock/test VersionedSection in the DB for integration tests
export const persistVersionedSection = async (
  context: MyContext,
  versionedSection: VersionedSection
): Promise<VersionedSection | null> => {
  // Ensure the createdById and modifiedId are set
  if (isNullOrUndefined(versionedSection.createdById) || isNullOrUndefined(versionedSection.modifiedById)) {
    versionedSection.createdById = context.token.id;
    versionedSection.modifiedById = context.token.id;
  }

  try {
    const created = await versionedSection.create(context);
    return isNullOrUndefined(created) ? null : created;
  } catch (e) {
    console.error(`Error persisting versionedSection ${versionedSection.name}: ${e.message}`);
    if (e.originalError) console.log(e.originalError);
    return null;
  }
}
