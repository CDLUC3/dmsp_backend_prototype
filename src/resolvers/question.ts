import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionOption } from "../models/QuestionOption";
import { Question } from "../models/Question";
import { getQuestionOptionsToRemove, markTemplateAsDirty } from "../services/questionService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { QuestionCondition } from "../models/QuestionCondition";
import { formatLogMessage } from "../logger";
import { isAdmin, isAuthorized } from "../services/authService";
import { hasPermissionOnSection } from "../services/sectionService";
import { GraphQLError } from "graphql";

export const resolvers: Resolvers = {
  Query: {
    // return all of the questions for the specified section
    questions: async (_, { sectionId }, context: MyContext): Promise<Question[]> => {
      const reference = 'questions resolver';
      try {
        if (isAuthorized(context.token)) {
          return await Question.findBySectionId(reference, context, sectionId);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a specific question
    question: async (_, { questionId }, context: MyContext): Promise<Question> => {
      const reference = 'question resolver';
      try {
        if (isAuthorized(context.token)) {
          return await Question.findById(reference, context, questionId);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
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
      questionTypeId,
      questionText,
      requirementText,
      guidanceText,
      sampleText,
      useSampleTextAsDefault,
      required,
      questionOptions } }, context: MyContext): Promise<Question> => {

      const reference = 'addQuestion resolver';
      try {
        // if the user is an admin and has permission on the section
        if (isAdmin(context.token) && await hasPermissionOnSection(context, templateId)) {
          const question = new Question({
            templateId,
            sectionId,
            displayOrder,
            isDirty,
            questionTypeId,
            questionText,
            requirementText,
            guidanceText,
            sampleText,
            useSampleTextAsDefault,
            required
          });

          // create the new question
          const newQuestion = await question.create(context);

          if (!newQuestion?.id) {
            // A null was returned so add a generic error and return it
            if (!question.errors['general']) {
              question.addError('general', 'Unable to create Question');
            }
            return question;
          }

          if (newQuestion && !newQuestion.hasErrors()) {
            const questionId = newQuestion.id;
            // Add all the associated question options to the questionOptions table
            if (questionOptions && questionOptions.length > 0) {
              await Promise.all(
                questionOptions.map(async (option) => {
                  const questionOption = new QuestionOption({
                    questionId: newQuestion.id,
                    text: option.text,
                    orderNumber: option.orderNumber,
                    isDefault: option.isDefault
                  });

                  await questionOption.create(context);
                })
              );
            }

            // Update the associated template to set isDirty=1
            await markTemplateAsDirty('Question resolver - addQuestion', context, templateId);

            // Return newly created question
            return await Question.findById(reference, context, questionId);
          }
          // Otherwise it had errors so return it as-is
          return newQuestion;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing question
    updateQuestion: async (_, { input: {
      questionId,
      questionTypeId,
      displayOrder,
      questionText,
      requirementText,
      guidanceText,
      sampleText,
      useSampleTextAsDefault,
      required,
      questionOptions } }, context: MyContext): Promise<Question> => {

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
            questionTypeId: questionTypeId ?? questionData.questionTypeId,
            questionText: questionText,
            requirementText: requirementText,
            guidanceText: guidanceText,
            sampleText: sampleText,
            useSampleTextAsDefault: useSampleTextAsDefault,
            required: required,
            isDirty: questionData.isDirty
          });

          const updatedQuestion = await question.update(context);
          const associationErrors = [];

          // If there are errors than throw a Bad User Input error
          if (updatedQuestion && !updatedQuestion.hasErrors()) {
            // Get existing questionOptions
            const existingQuestionOptions = await QuestionOption.findByQuestionId('question resolver', context, questionId);

            // Create a Map of existing options for quick lookup by ID or unique identifier
            const existingOptionsMap = new Map(
              existingQuestionOptions.map(option => [option.id, option])
            );

            // Get list of options that need to be removed
            const optionsToRemove = await getQuestionOptionsToRemove(questionOptions as QuestionOption[], context, questionId);

            const removeErrors = [];
            // Remove question options that are no longer in the updated questionOptions array
            if (optionsToRemove.length > 0) {
              await Promise.all(
                optionsToRemove.map(async (option) => {
                  const questionOption = new QuestionOption({
                    questionId: option.questionId,
                    id: option.id
                  });

                  const result = await questionOption.delete(context);
                  if (!result) {
                    removeErrors.push(result.text);
                  }
                })
              );
            }
            if (removeErrors.length > 0) {
              associationErrors.push(`unable to remove options: ${removeErrors.join(', ')}`);
            }

            // Separate incoming options into "to update" and "to create"
            const optionsToUpdate = [];
            const optionsToCreate = [];

            questionOptions.forEach(option => {
              if (existingOptionsMap.has(option.id)) {
                // Add to update list, merging the new data with the existing data
                optionsToUpdate.push({
                  ...existingOptionsMap.get(option.id), // existing option data
                  ...option // updated fields from input
                });
              } else {
                // Add to create list
                optionsToCreate.push({
                  questionId,
                  ...option // new option fields
                });
              }
            });

            const updateErrors = [];
            // Update existing options
            if (optionsToUpdate.length > 0) {
              await Promise.all(
                optionsToUpdate.map(async option => {
                  const questionOption = new QuestionOption(option);
                  const result = await questionOption.update(context); // Call your update method
                  if (!result) {
                    updateErrors.push(result.text);
                  }
                })
              );
            }
            if (updateErrors.length > 0) {
              associationErrors.push(`unable to update options: ${updateErrors.join(', ')}`);
            }

            const createErrors = [];
            // Create new options
            if (optionsToCreate.length > 0) {
              await Promise.all(
                optionsToCreate.map(async option => {
                  const questionOption = new QuestionOption(option);
                  const result = await questionOption.create(context); // Call your create method
                  if (!result) {
                    createErrors.push(result.text);
                  }
                })
              );
            }
            if (createErrors.length > 0) {
              associationErrors.push(`unable to create options: ${createErrors.join(', ')}`);
            }

            if (associationErrors.length > 0) {
              updatedQuestion.addError('questionOptions', `Update complete but we were ${associationErrors.join('; ')}`);
            }
          }

          // Update the associated template to set isDirty=1
          await markTemplateAsDirty('Question resolver - updateQuestion', context, questionData.templateId);

          // Refetch the question or the updated question with errors
          return updatedQuestion.hasErrors() ? updatedQuestion : await Question.findById(reference, context, questionId);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // remove a question
    removeQuestion: async (_, { questionId }, context: MyContext): Promise<Question> => {
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
          await markTemplateAsDirty('Question resolver - removeQuestion', context, questionData.templateId);

          // The delete will also delete all associated questionOptions
          return await question.delete(context);

        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  Question: {
    questionConditions: async (parent: Question, _, context: MyContext): Promise<QuestionCondition[]> => {
      return await QuestionCondition.findByQuestionId(
        'Chained Question.questionConditions',
        context,
        parent.id
      );
    },
    questionOptions: async (parent: Question, _, context: MyContext): Promise<QuestionOption[]> => {
      return await QuestionOption.findByQuestionId(
        'Chained Question.questionOptions',
        context,
        parent.id
      );
    },
  }
};
