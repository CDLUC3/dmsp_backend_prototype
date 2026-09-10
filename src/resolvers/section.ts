import {
  Question as QuestionGql,
  ReorderSectionsResult,
  Resolvers,
  Section as SectionGql,
  Tag as TagGql,
} from "../types.js";
import { MyContext } from "../context.js";
import { Section } from "../models/Section.js";
import { VersionedSection } from "../models/VersionedSection.js";
import { Tag } from "../models/Tag.js";
import { Template } from "../models/Template.js";
import { cloneSection, hasPermissionOnSection, updateDisplayOrders } from "../services/sectionService.js";
import { ForbiddenError, NotFoundError, AuthenticationError, InternalServerError, BadRequestError } from "../utils/graphQLErrors.js";
import { Question } from "../models/Question.js";
import { isAdmin, isAuthorized, isSuperAdmin } from "../services/authService.js";
import { prepareObjectForLogs } from "../logger.js";
import { GraphQLError } from "graphql";
import { VersionedQuestion } from "../models/VersionedQuestion.js";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";

export const resolvers: Resolvers = {
  Query: {
    // Cast needed on all Section-returning resolvers below: the Section model's `tags`
    // field doesn't structurally match the generated Section type (e.g. nested Tag.slug
    // is optional on the model but required in the schema), and there are no codegen
    // mappers configured to reconcile this.
    // return all of the sections for the specified template
    sections: async (_, { templateId }, context: MyContext) => {
      const reference = 'sections resolver';
      try {
        if (isAuthorized(context?.token)) {
          const sections = await Section.findByTemplateId(reference, context, templateId);
          return sections as unknown as SectionGql[];
        }

        throw AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a specific section
    section: async (_, { sectionId }, context: MyContext) => {
      const reference = 'section resolver';
      try {
        if (isAuthorized(context.token)) {
          const section = await Section.findById(reference, context, sectionId);
          return section as unknown as SectionGql | null;
        }

        throw AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
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
          guidance,
          displayOrder
        }
      },
      context: MyContext
    ) => {
      const reference = 'addSection resolver';
      try {
        if (isAdmin(context?.token) && await hasPermissionOnSection(context, templateId)) {
          // Default to the next available display order when the caller doesn't specify one
          const resolvedDisplayOrder = displayOrder ?? (await Section.findMaxDisplayOrder(reference, context, templateId)) + 1;
          let section = new Section({
            name,
            templateId,
            introduction: introduction ?? undefined,
            requirements: requirements ?? undefined,
            guidance: guidance ?? undefined,
            displayOrder: resolvedDisplayOrder
          });

          // if a copyFromVersionedSectionId is provided, clone the section
          let original: VersionedSection | null = null;

          if (copyFromVersionedSectionId) {
            original = await VersionedSection.findById(reference, context, copyFromVersionedSectionId);
            if (!original) {
              throw NotFoundError('Unable to copy the specified section');
            }

            section = cloneSection(context.token?.id, templateId, original);
            section.name = name;
            const maxDisplayOrder = await Section.findMaxDisplayOrder(reference, context, templateId);
            section.displayOrder = maxDisplayOrder + 1;
          }

          // create the new section
          const newSection = await section.create(context, templateId);

          // if the section was not created, return the errors
          if (!newSection?.id) {
            // A null was returned so add a generic error and return it
            if (!section.errors['general']) {
              section.addError('general', 'Unable to create the section');
            }
            return section as unknown as SectionGql;
          }

          // if a copyFromVersionedSectionId is provided, clone all the questions
          if (copyFromVersionedSectionId && original && !isNullOrUndefined(original.id)) {
            const versionedQuestions = await VersionedQuestion.findByVersionedSectionId(
              reference,
              context,
              original.id
            );

            // Add questions from the copied versionedSection to the section
            for (const versionedQuestion of versionedQuestions) {
              const newQuestion = new Question({
                ...versionedQuestion,
                isDirty: true,
                sourceQuestionId: versionedQuestion.questionId,
                sectionId: newSection.id,
                templateId: templateId,
                id: undefined, // ensure the id is not set since we're creating a new question
              });

              const addedQuestion = await newQuestion.create(context);

              if (!addedQuestion?.id) {
                // A null was returned so add a generic error and return it
                if (!newQuestion.errors['general']) {
                  newQuestion.addError('general', 'Unable to create the question');
                }
              } else if (!isNullOrUndefined(versionedQuestion.id)) {
                // Copy the source versioned question's tags onto the newly cloned question
                const sourceTags = await Tag.findByVersionedQuestionId(reference, context, versionedQuestion.id);
                for (const tag of sourceTags) {
                  const wasAdded = await tag.addToQuestion(context, addedQuestion.id);
                  if (!wasAdded) {
                    context.logger.error(`${reference} failed to copy tag ${tag.id} to cloned question ${addedQuestion.id}`);
                    newQuestion.addError('general', 'Question created but unable to copy all tags');
                  }
                }
              }
            }
          }

          // Update the associated template to set isDirty=1
          await Template.markTemplateAsDirty('Section resolver - addSection', context, templateId);

          // Return newly created section
          const created = await Section.findById(reference, context, newSection.id);
          if (!created) {
            throw InternalServerError();
          }
          return created as unknown as SectionGql;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
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
          displayOrder,
          bestPractice
        }
      },
      context: MyContext
    ) => {
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
            name: name ?? sectionData.name,
            introduction: introduction ?? undefined,
            requirements: requirements ?? undefined,
            guidance: guidance ?? undefined,
            displayOrder: displayOrder ?? sectionData.displayOrder,
            isDirty: true  // Mark as dirty for update
          });

          // Only allow the bestPractice flag to be changed if the user is a Super admin!
          section.bestPractice = isSuperAdmin(context.token) ? (bestPractice ?? sectionData.bestPractice) : sectionData.bestPractice;

          const updatedSection = await section.update(context);

          if (!updatedSection?.id) {
            // A null was returned so add a generic error and return it
            if (!section.errors['general']) {
              section.addError('general', 'Unable to update the section');
            }
            return section as unknown as SectionGql;
          }

          // Update the associated template to set isDirty=1
          await Template.markTemplateAsDirty('Section resolver - updateSection', context, sectionData.templateId);

          // Return newly updated section
          const reloaded = await Section.findById(reference, context, updatedSection.id);
          if (!reloaded) {
            throw InternalServerError();
          }
          return reloaded as unknown as SectionGql;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Change the section's display order
    updateSectionDisplayOrder: async (
      _,
      { sectionId, newDisplayOrder },
      context: MyContext
    ): Promise<ReorderSectionsResult> => {
      const reference = 'updateSectionDisplayOrder resolver';
      try {
        if (isAdmin(context.token)) {
          // Find the section that is being repositioned
          const section = await Section.findById(reference, context, sectionId);

          if (!section) {
            throw NotFoundError();
          }

          // Check that the new display order has actually changed
          if (section.displayOrder === newDisplayOrder) {
            throw BadRequestError('The new display order is the same as the current one');
          }

          // Check that user has permission to update this section
          if (await hasPermissionOnSection(context, section.templateId)) {
            try {
              // Reorder the sections
              const reorderedSections = await updateDisplayOrders(
                context,
                section.templateId,
                sectionId,
                newDisplayOrder
              );

              await Template.markTemplateAsDirty(reference, context, section.templateId);

              // Cast needed: the Section model doesn't structurally match the generated
              // Section type (e.g. nested Tag.slug is optional on the model but required
              // in the schema), and there are no codegen mappers configured to reconcile this.
              return { sections: (reorderedSections ?? []) as unknown as SectionGql[] };

            } catch (err) {
              context.logger.error(prepareObjectForLogs(err), `${reference} failed: sectionId: ${sectionId}`);
              return { sections: [], errors: { general: err instanceof Error ? err.message : String(err) } };
            }
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // remove a section
    removeSection: async (_, { sectionId }, context: MyContext) => {
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

          // Update the associated template to set isDirty=1
          await Template.markTemplateAsDirty('Section resolver - removeSection', context, sectionData.templateId);

          if (!deleted || deleted.hasErrors()) {
            section.addError('general', 'Unable to delete the section');
            return section as unknown as SectionGql;
          }

          return deleted as unknown as SectionGql;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Section: {
    // Chained resolver to fetch the Affiliation info for the user
    // Cast needed: the Tag model's `slug` is optional but required in the generated Tag
    // type, and there are no codegen mappers configured to reconcile this.
    tags: async (parent, _, context: MyContext) => {
      if (isNullOrUndefined(parent.id)) {
        return [];
      }
      const tags = await Tag.findBySectionId('Chained Section.tags', context, parent.id);
      return tags as unknown as TagGql[];
    },
    template: async (parent, _, context: MyContext): Promise<Template | null> => {
      // `parent` is actually the Section model instance at runtime (not just the generated
      // shape), which is where `templateId` lives.
      const { templateId } = parent as unknown as Section;
      return await Template.findById('Chained Section.template', context, templateId);
    },
    // Cast needed: the Question model's `tags` field doesn't structurally match the
    // generated Question type for the same reason as above.
    questions: async (parent, _, context: MyContext) => {
      if (isNullOrUndefined(parent.id)) {
        return [];
      }
      const questions = await Question.findBySectionId('Chained Section.questions', context, parent.id);
      return questions as unknown as QuestionGql[];
    },
    // `parent` is contextually typed as the generated Section (not the model class) here,
    // which is all `created`/`modified` need.
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  }
};
