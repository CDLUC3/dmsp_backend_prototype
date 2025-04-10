import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Template } from "../models/Template";
import { hasPermissionOnTemplate } from "./templateService";
import { VersionedSection } from "../models/VersionedSection";
import { NotFoundError } from "../utils/graphQLErrors";
import { Question } from "../models/Question";
import { generateQuestionVersion } from "./questionService";
import { formatLogMessage } from "../logger";

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
    createdById: section.createdById,
    created: section.created,
    modifiedById: section.modifiedById,
    modified: section.modified,
  });

  try {
    const created = await versionedSection.create(context);

    // If the creation was successful
    if (created && !created.hasErrors()) {
      // Create a version for all the associated questions
      const questions = await Question.findBySectionId('generateSectionVersion', context, section.id);
      let allQuestionsWereVersioned = true;

      for (const question of questions) {
        const questionInstance = new Question({
          ...question
        });
        const passed = await generateQuestionVersion(context, questionInstance, versionedTemplateId, created.id);
        if (!passed) {
          allQuestionsWereVersioned = false;
        }
      }

      // Only continue if all the associated questions were properly versioned
      if (allQuestionsWereVersioned) {
        // Reset the dirty flag on the section and save it
        section.isDirty = false;
        const updated = await section.update(context, true);

        if (updated && !updated.hasErrors()) return true;

        const msg = `Unable to set the isDirty flag for section: ${section.id}`;
        formatLogMessage(context).error(updated.errors, msg);
        throw new Error(msg);
      }
    } else {
      const msg = `Unable to create a new version for section: ${section.id}`;
      formatLogMessage(context).error(created.errors, msg);
      throw new Error(msg);
    }
  } catch (err) {
    formatLogMessage(context).error(err, `Unable to generate a new version for section: ${section.id}`);
    throw err;
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
  if (!context || !context.token) return false;

  // Find associated template info
  const template = await Template.findById('section resolver.hasPermission', context, templateId);

  if (!template) {
    throw NotFoundError();
  }

  // Offload permission checks to the Template
  return await hasPermissionOnTemplate(context, template);
}