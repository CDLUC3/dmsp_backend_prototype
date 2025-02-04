import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { VersionedSection } from "../models/VersionedSection";
import { Tag } from "../models/Tag";
import { Template } from "../models/Template";
import { cloneSection, hasPermissionOnSection } from "../services/sectionService";
import { ForbiddenError, NotFoundError, AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { Question } from "../models/Question";
import { isAdmin, isAuthorized, isSuperAdmin } from "../services/authService";
import { formatLogMessage } from "../logger";


export const resolvers: Resolvers = {
  Query: {
    // return all of the sections for the specified template
    sections: async (_, { templateId }, context: MyContext): Promise<Section[]> => {
      const reference = 'sections resolver';
      try {
        if (isAuthorized(context?.token)) {
          return await Section.findByTemplateId(reference, context, templateId);
        }

        throw AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a specific section
    section: async (_, { sectionId }, context: MyContext): Promise<Section> => {
      const reference = 'section resolver';
      try {
        if (isAuthorized(context.token)) {
          return await Section.findById(reference, context, sectionId);
        }

        throw AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  Mutation: {
    // add a new section
    addSection: async (
      _,
      {
        input: {
          templateId,
          name,
          copyFromVersionedSectionId,
          introduction,
          requirements,
          tags,
          guidance,
          displayOrder
        }
      },
      context: MyContext
    ): Promise<Section> => {
      const reference = 'addSection resolver';
      try {
        if (isAdmin(context?.token) && await hasPermissionOnSection(context, templateId)) {
          let section = new Section({ name, templateId, introduction, requirements, guidance, displayOrder });

          // if a copyFromVersionedSectionId is provided, clone the section
          if (copyFromVersionedSectionId) {
            const original = await VersionedSection.findById(reference, context, copyFromVersionedSectionId);

            if (!original)  {
              throw NotFoundError('Unable to copy the specified section');
            }

            section = cloneSection(context.token?.id, templateId, original);
            section.name = name;
          }

          // create the new section
          const newSection = await section.create(context, templateId);

          // if the section was not created, return the errors
          if (!newSection?.id) {
            // A null was returned so add a generic error and return it
            if (!section.errors['general']) {
              section.addError('general', 'Unable to create the section');
            }
            return section;
          }

          // Add tags to the section
          if (tags && Array.isArray(tags) && tags.length > 0) {
            const addTagErrors = [];
            for (const tagIn of tags) {
              const tag = await Tag.findById(reference, context, tagIn.id);
              if (tag) {
                const wasAdded = tag.addToSection(context, newSection.id)
                if (!wasAdded) {
                  addTagErrors.push(tag.name);
                }
              }
            }
            if (addTagErrors.length > 0) {
              newSection.addError('tags', `Section created but we were unable to assign tags: ${addTagErrors.join(', ')}`);
            }
          }

          // Return newly created section with tags
          return newSection.hasErrors() ? newSection : await Section.findById(reference, context, newSection.id);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing section
    updateSection: async (
      _,
      {
        input: {
          sectionId,
          name,
          introduction,
          requirements,
          guidance,
          tags,
          displayOrder,
          bestPractice
        }
      },
      context: MyContext
    ): Promise<Section> => {
      const reference = 'updateSection resolver';
      try {
        // Get Section based on provided sectionId
        const sectionData = await Section.findById('section resolver', context, sectionId);

        // Throw Not Found error if Section is not found
        if (!sectionData) {
          throw NotFoundError('Section not found');
        }

        // Check that user has permission to update this section
        if (isAdmin(context?.token) && await hasPermissionOnSection(context, sectionData.templateId)) {
          const section = new Section({
            id: sectionData.id,
            templateId: sectionData.templateId,
            createdById: sectionData.createdById,
            name: name,
            introduction: introduction,
            requirements: requirements,
            guidance: guidance,
            displayOrder: displayOrder,
            isDirty: true  // Mark as dirty for update
          });

          // Only allow the bestPractice flag to be changed if the user is a Super admin!
          section.bestPractice = isSuperAdmin(context.token) ? bestPractice : sectionData.bestPractice;

          const updatedSection = await section.update(context);

          if (!updatedSection?.id) {
            // A null was returned so add a generic error and return it
            if (!section.errors['general']) {
              section.addError('general', 'Unable to update the section');
            }
            return section;
          }

          // Get current tags for the section
          const currentTags = await Tag.findBySectionId(reference, context, sectionId);
          const currentTagIds = currentTags.map((tag) => tag.id);

          // Use the helper function to determine which Tags to keep and which to remove
          const { idsToBeRemoved, idsToBeSaved } = Section.reconcileAssociationIds(
            currentTagIds,
            tags ? (tags as Tag[]).map((d) => d.id) : []
          );

          // Delete any Tag associations that were removed
          const removeTagErrors = [];
          for (const id of idsToBeRemoved) {
            const tag = await Tag.findById(reference, context, id);
            if (tag) {
              const wasRemoved = tag.removeFromSection(context, updatedSection.id)
              if (!wasRemoved) {
                removeTagErrors.push(tag.name);
              }
            }
          }
          // if any errors were found when adding/removing tags then return them
          if (removeTagErrors.length > 0) {
            updatedSection.addError('tags', `Saved but we were unable to remove tags: ${removeTagErrors.join(', ')}`);
          }

          // Add any new Tag associations
          const addTagErrors = [];
          for (const id of idsToBeSaved) {
            const tag = await Tag.findById(reference, context, id);
            if (tag) {
              const wasAdded = tag.addToSection(context, updatedSection.id)
              if (!wasAdded) {
                addTagErrors.push(tag.name);
              }
            }
          }
          if (addTagErrors.length > 0) {
            updatedSection.addError('tags', `Saved but we were unable to assign tags: ${addTagErrors.join(', ')}`);
          }

          // Return newly updated section with tags
          return updatedSection.hasErrors() ? updatedSection : await Section.findById(reference, context, updatedSection.id);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // remove a section
    removeSection: async (_, { sectionId }, context: MyContext): Promise<Section> => {
      const reference = 'removeSection resolver';
      try {
        // Retrieve existing Section
        const sectionData = await Section.findById(reference, context, sectionId);

        // Throw Not Found error if Section is not found
        if (!sectionData) {
          throw NotFoundError('Section not found');
        }

        if (isAdmin(context?.token) && await hasPermissionOnSection(context, sectionData.templateId)) {
          //Need to create a new instance of Section so that it recognizes the 'delete' function of that instance
          const section = new Section({ ...sectionData, id: sectionId });

          const deleted = await section.delete(context);

          if (!deleted || deleted.hasErrors()) {
            section.addError('general', 'Unable to delete the section');
          }
          return section.hasErrors() ? section : deleted;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }

    },
  },

  Section: {
    // Chained resolver to fetch the Affiliation info for the user
    tags: async (parent: Section, _, context: MyContext): Promise<Tag[]> => {
      return await Tag.findBySectionId('Chained Section.tags', context, parent.id);
    },
    template: async (parent: Section, _, context: MyContext): Promise<Template> => {
      return await Template.findById('Chained Section.template', context, parent.templateId);
    },
    questions: async (parent: Section, _, context: MyContext): Promise<Question[]> => {
      return await Question.findBySectionId('Chained Section.questions', context, parent.id)
    },
  }
};
