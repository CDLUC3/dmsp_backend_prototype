import { Question as QuestionGql, ReorderQuestionsResult, Resolvers, Tag as TagGql } from "../types.js";
import { MyContext } from "../context.js";
import { Question } from "../models/Question.js";
import { Template } from "../models/Template.js";
import { QuestionConditionGroup } from "../models/QuestionConditionGroup.js";
import { updateDisplayOrders, questionSupportsSelectableOptions } from "../services/questionService.js";
import {
  AuthenticationError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from "../utils/graphQLErrors.js";
import { Tag } from "../models/Tag.js";
import { prepareObjectForLogs } from "../logger.js";
import { isAdmin, isAuthorized } from "../services/authService.js";
import { hasPermissionOnSection } from "../services/sectionService.js";
import { GraphQLError } from "graphql";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";


export const resolvers: Resolvers = {
  Query: {
    // return all of the questions for the specified section
    // Cast needed on all Question-returning resolvers below: the Question model's `tags`
    // field doesn't structurally match the generated Question type (e.g. nested Tag.slug
    // is optional on the model but required in the schema), and there are no codegen
    // mappers configured to reconcile this.
    questions: async (_, { sectionId }, context: MyContext) => {
      const reference = 'questions resolver';
      try {
        if (isAuthorized(context.token)) {
          const questions = await Question.findBySectionId(reference, context, sectionId);
          return questions as unknown as QuestionGql[];
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a specific question
    question: async (_, { questionId }, context: MyContext) => {
      const reference = 'question resolver';
      try {
        if (isAuthorized(context.token)) {
          const question = await Question.findById(reference, context, questionId);
          if (isNullOrUndefined(question)) {
            throw NotFoundError();
          }
          return question as unknown as QuestionGql;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return all prior questions in the template that can be used as
    // display-logic triggers for the specified question
    triggerQuestionsForQuestion: async (_, { questionId }, context: MyContext) => {
      const reference = 'triggerQuestionsForQuestion resolver';
      try {
        if (!isAuthorized(context.token)) {
          throw context?.token ? ForbiddenError() : AuthenticationError();
        }

        const targetQuestion = await Question.findById(reference, context, questionId);
        if (!targetQuestion) {
          throw NotFoundError('Question not found');
        }

        const priorQuestions = await Question.findPriorQuestionsForQuestion(
          reference,
          context,
          questionId
        );

        return priorQuestions.filter(questionSupportsSelectableOptions) as unknown as QuestionGql[];
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },
  Mutation: {
    // add a new question
    addQuestion: async (_, { input: {
      templateId,
      sectionId,
      displayOrder,
      isDirty,
      json,
      questionText,
      requirementText,
      guidanceText,
      sampleText,
      useSampleTextAsDefault,
      required,
      tags,
    } }, context: MyContext) => {

      const reference = 'addQuestion resolver';
      try {
        // if the user is an admin and has permission on the section
        if (isAdmin(context.token) && await hasPermissionOnSection(context, templateId)) {
          const question = new Question({
            templateId,
            sectionId,
            // `displayOrder`/`json`/`questionText` are required by the model; leave them
            // blank/zeroed so `isValid()` flags it the same way an undefined value would have
            // prior to strict null checks, rather than silently guessing a value.
            displayOrder: displayOrder ?? 0,
            isDirty: isDirty ?? undefined,
            json: json ?? '',
            questionText: questionText ?? '',
            requirementText: requirementText ?? undefined,
            guidanceText: guidanceText ?? undefined,
            sampleText: sampleText ?? undefined,
            useSampleTextAsDefault: useSampleTextAsDefault ?? undefined,
            required: required ?? undefined
          });

          // create the new question
          const newQuestion = await question.create(context);

          if (!newQuestion?.id) {
            // A null was returned so add a generic error and return it
            if (!question.errors['general']) {
              question.addError('general', 'Unable to create Question');
            }
            return question as unknown as QuestionGql;
          }

          if (newQuestion && !newQuestion.hasErrors()) {
            const questionId = newQuestion.id;
            // Update the associated template to set isDirty=1
            await Template.markTemplateAsDirty('Question resolver - addQuestion', context, templateId);

            // Add any new Tags provided in the request
            const addTagErrors = [];
            if (Array.isArray(tags) && tags.length > 0) {
              for (const item of tags) {
                if (isNullOrUndefined(item.id)) {
                  addTagErrors.push('Tag id missing');
                  continue;
                }

                const tag = await Tag.findById(reference, context, item.id);

                if (!tag) {
                  addTagErrors.push(`Tag ${item.id} not found`);
                  continue;
                }

                const wasAdded = tag.addToQuestion(context, questionId)
                if (!wasAdded) {
                  addTagErrors.push(tag.name);
                }

              }
            }

            if (addTagErrors.length > 0) {
              newQuestion.addError('tags', `Saved but we were unable to assign tags: ${addTagErrors.join(', ')}`);
            }

            // Return newly created section with tags
            if (newQuestion.hasErrors()) {
              return newQuestion as unknown as QuestionGql;
            }
            const finalQuestion = await Question.findById(reference, context, newQuestion.id);
            if (!finalQuestion) {
              throw NotFoundError('Question not found');
            }
            return finalQuestion as unknown as QuestionGql;
          }
          // Otherwise it had errors so return it as-is
          return newQuestion as unknown as QuestionGql;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing question
    updateQuestion: async (_, { input: {
      questionId,
      displayOrder,
      json,
      questionText,
      requirementText,
      guidanceText,
      sampleText,
      useSampleTextAsDefault,
      required,
      tags
    } }, context: MyContext) => {
      const reference = 'updateQuestion resolver';
      try {
        // Get Question based on provided questionId
        const questionData = await Question.findById(reference, context, questionId);

        // Throw Not Found error if Question is not found
        if (!questionData) {
          throw NotFoundError('Question not found');
        }

        // Check that user has permission to update this question
        if (isAdmin(context.token) && await hasPermissionOnSection(context, questionData.templateId)) {
          const question = new Question({
            id: questionId,
            sectionId: questionData.sectionId,
            templateId: questionData.templateId,
            createdById: questionData.createdById,
            displayOrder: displayOrder ?? questionData.displayOrder,
            json: json ?? questionData.json,
            questionText: questionText ?? questionData.questionText,
            requirementText: requirementText ?? undefined,
            guidanceText: guidanceText ?? undefined,
            sampleText: sampleText ?? undefined,
            useSampleTextAsDefault: useSampleTextAsDefault ?? undefined,
            required: required ?? undefined,
            isDirty: questionData.isDirty
          });

          const updatedQuestion = await question.update(context);

          if (updatedQuestion && !updatedQuestion.hasErrors()) {
            // Update the associated template to set isDirty=1
            await Template.markTemplateAsDirty('Question resolver - updateQuestion', context, questionData.templateId);

            // Get current tags for the question
            const currentTags = await Tag.findByQuestionId(reference, context, questionId);
            const currentTagIds = currentTags.map((tag) => tag.id).filter((id): id is number => !isNullOrUndefined(id));

            // Use the helper function to determine which Tags to keep and which to remove
            const { idsToBeRemoved, idsToBeSaved } = Question.reconcileAssociationIds(
              currentTagIds,
              tags ? tags.map((d) => d.id).filter((id): id is number => !isNullOrUndefined(id)) : []
            );

            // Delete any Tag associations that were removed
            const removeTagErrors = [];
            for (const id of idsToBeRemoved) {
              const tag = await Tag.findById(reference, context, id as number);
              if (tag) {
                const wasRemoved = tag.removeFromQuestion(context, questionId)
                if (!wasRemoved) {
                  removeTagErrors.push(tag.name);
                }
              }
            }
            // if any errors were found when adding/removing tags then return them
            if (removeTagErrors.length > 0) {
              updatedQuestion.addError('tags', `Saved but we were unable to remove tags: ${removeTagErrors.join(', ')}`);
            }

            // Add any new Tag associations
            const addTagErrors = [];
            for (const id of idsToBeSaved) {
              const tag = await Tag.findById(reference, context, id as number);
              if (tag) {
                const wasAdded = tag.addToQuestion(context, questionId)
                if (!wasAdded) {
                  addTagErrors.push(tag.name);
                }
              }
            }
            if (addTagErrors.length > 0) {
              updatedQuestion.addError('tags', `Saved but we were unable to assign tags: ${addTagErrors.join(', ')}`);
            }

            // Refetch the question or the updated question with errors
            const final = await Question.findById(reference, context, questionId);
            if (!final) {
              throw NotFoundError('Question not found');
            }

            return final as unknown as QuestionGql;
          }

          // Otherwise return the Question with errors
          if (!updatedQuestion) {
            throw NotFoundError('Unable to update question');
          }
          return updatedQuestion as unknown as QuestionGql;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Change the section's display order
    updateQuestionDisplayOrder: async (
      _,
      { questionId, newDisplayOrder },
      context: MyContext
    ): Promise<ReorderQuestionsResult> => {
      const reference = 'updateQuestionDisplayOrder resolver';
      try {
        if (isAdmin(context.token)) {
          // Find the question that is being repositioned
          const question = await Question.findById(reference, context, questionId);

          if (!question) {
            throw NotFoundError();
          }

          // Check that the new display order has actually changed
          if (question.displayOrder === newDisplayOrder) {
            throw BadRequestError('The new display order is the same as the current one');
          }

          // Check that user has permission to update this question
          if (await hasPermissionOnSection(context, question.templateId)) {
            try {
              // Reorder the sections
              const reordered = await updateDisplayOrders(
                context,
                question.sectionId,
                questionId,
                newDisplayOrder
              );

              // Update the associated template to set isDirty=1
              await Template.markTemplateAsDirty('Question resolver - updateQuestionDisplayOrder', context, question.templateId);

              // Cast needed: the Question model doesn't structurally match the generated
              // Question type (e.g. nested Tag.slug is optional on the model but required
              // in the schema), and there are no codegen mappers configured to reconcile this.
              return { questions: (reordered ?? []) as unknown as QuestionGql[] };

            } catch (err) {
              context.logger.error(prepareObjectForLogs(err), `${reference} failed: questionId: ${questionId}`);
              return { questions: [], errors: { general: err instanceof Error ? err.message : String(err) } };
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

    // remove a question
    removeQuestion: async (_, { questionId }, context: MyContext) => {
      const reference = 'removeQuestion resolver';
      try {
        // Retrieve existing Question
        const questionData = await Question.findById(reference, context, questionId);

        // Throw Not Found error if Question is not found
        if (!questionData) {
          throw NotFoundError('Question not found');
        }

        // if the user is an admin and has permission on the section
        if (isAdmin(context.token) && await hasPermissionOnSection(context, questionData.templateId)) {
          //Need to create a new instance of Question so that it recognizes the 'delete' function of that instance
          const question = new Question({ ...questionData, id: questionId });

          // Update the associated template to set isDirty=1
          await Template.markTemplateAsDirty('Question resolver - removeQuestion', context, questionData.templateId);

          // The delete will also delete all associated questionOptions
          const deletedQuestion = await question.delete(context);
          if (!deletedQuestion) {
            throw NotFoundError('Unable to delete question');
          }
          return deletedQuestion as unknown as QuestionGql;

        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  Question: {
    // Chained resolver to fetch the Tag info
    tags: async (parent, _, context: MyContext) => {
      if (isNullOrUndefined(parent.id)) {
        return [];
      }
      // Cast needed: the Tag model doesn't structurally match the generated Tag type
      // (e.g. `slug` is optional on the model but required in the schema), and there
      // are no codegen mappers configured to reconcile this.
      const tags = await Tag.findByQuestionId('Chained Question.tags', context, parent.id);
      return tags as unknown as TagGql[];
    },
    conditionGroups: async (parent, _, context: MyContext): Promise<QuestionConditionGroup[]> => {
      if (isNullOrUndefined(parent.id)) {
        return [];
      }
      return await QuestionConditionGroup.findByQuestionId(
        'Chained Question.conditionGroups',
        context,
        parent.id
      );
    },
    // `parent` is contextually typed as the generated Question (not the model class) here,
    // which is all `created`/`modified` need.
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  }
};
