import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Template } from "../models/Template";
import { SectionTag } from "../models/SectionTag";
import { Tag } from "../models/Tag";
import { hasPermissionOnTemplate } from "./templateService";
import { VersionedSection } from "../models/VersionedSection";
import { NotFoundError } from "../utils/graphQLErrors";
import { Question } from "../models/Question";
import { generateQuestionVersion } from "./questionService";
import { formatLogMessage, logger } from "../logger";

// Creates a new Version/Snapshot the specified Section (as a point in time snapshot)
//    - Creates a new VersionedSection including all of the related Questions
//    - Resets the isDirty flag on the Section
export const generateSectionVersion = async (
  context: MyContext,
  section: Section,
  versionedTemplateId: number,
): Promise<boolean> => {

  // If the section has no id then it has not yet been saved so throw an error
  if (!section.id) {
    throw new Error('Cannot publish unsaved Section');
  }

  // Create the new Version
  const versionedSection = new VersionedSection({
    versionedTemplateId: versionedTemplateId,
    sectionId: section.id,
    name: section.name,
    introduction: section.introduction,
    requirements: section.requirements,
    guidance: section.guidance,
    displayOrder: section.displayOrder,
    tags: section.tags,
  });

  try {
    const created = await versionedSection.create(context);

    // If the creation was successful
    if (created && (!created.errors || (Array.isArray(created.errors) && created.errors.length === 0))) {
      // Create a version for all the associated questions
      const questions = await Question.findBySectionId('generateSectionVersion', context, section.id);
      let allQuestionsWereVersioned = true;

      questions.forEach(async (question) => {
        const questionInstance = new Question({
          ...question
        });
        if (!await generateQuestionVersion(context, questionInstance, versionedTemplateId, created.id)) {
          allQuestionsWereVersioned = false;
        }
      });

      // Only continue if all the associated questions were properly versioned
      if (allQuestionsWereVersioned) {
        // Reset the dirty flag on the section and save it
        section.isDirty = false;
        const updated = await section.update(context);
        if (updated && updated.errors?.length <= 0) {
          return true;
        } else {
          const msg = `Unable to generateSectionVersion for section: ${section.id}, errs: ${updated.errors}`;
          formatLogMessage(logger).error(null, msg);
        }
      }
    } else {
      const msg = `Unable to generateSectionVersion for section: ${section.id}, errs: ${created.errors}`;
      formatLogMessage(logger).error(null, msg);
    }
  } catch (err) {
    formatLogMessage(logger).error(err, `Unable to generateSectionVersion for section: ${section.id}`);
  }

  return false;
}

// Make a copy of the specified Section
export const cloneSection = (
  clonedById: number,
  templateId: number,
  section: Section | VersionedSection
): Section => {
  // If the incoming is a VersionedSection, then use the sectionId (the section it was based off of)
  const sourceId = Object.keys(section).includes('sectionId') ? section['sectionId'] : section.id;
  const sectionCopy = new Section({
    sourceSectionId: sourceId,
    name: `Copy of ${section.name}`,
    introduction: section.introduction,
    requirements: section.requirements,
    guidance: section.guidance,
    displayOrder: section.displayOrder,
    templateId: templateId
  });

  sectionCopy.createdById = clonedById;
  return sectionCopy;
}

// Determine whether the specified user has permission to access the Section
export const hasPermissionOnSection = async (context: MyContext, templateId: number): Promise<boolean> => {
  // Find associated template info
  const template = await Template.findById('section resolver.hasPermission', context, templateId);

  if (!template) {
    throw NotFoundError();
  }

  // Offload permission checks to the Template
  return hasPermissionOnTemplate(context, template);
}

export const getTagsToAdd = async (tags: Tag[], context: MyContext, sectionId: number): Promise<Tag[]> => {
  //Get all the existing tags associated with this section in SectionTags
  const existingTags = await SectionTag.getSectionTagsBySectionId('updateSection resolver', context, sectionId);

  // Create a Set of existing tag ids
  const existingTagIds = new Set(existingTags.map(sectionTag => sectionTag.tagId));

  // Filter out the tags that already exist in the sectiontable.
  const tagsToAdd = tags.filter(tag => !existingTagIds.has(tag.id));

  return Array.isArray(tagsToAdd) ? tagsToAdd : [];
}
