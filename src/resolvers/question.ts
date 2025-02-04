import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionOption } from "../models/QuestionOption";
import { Question } from "../models/Question";
import { hasPermissionOnQuestion } from "../services/questionService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { QuestionCondition } from "../models/QuestionCondition";
import { formatLogMessage } from "../logger";
import { isAdmin, isAuthorized } from "../services/authService";
import { hasPermissionOnSection } from "../services/sectionService";
import { hasPermissionOnTemplate } from "../services/templateService";


export const resolvers: Resolvers = {
  Query: {
    questions: async (_, { sectionId }, context: MyContext): Promise<Question[]> => {
      const reference = 'questions resolver';
      try {
        if (isAuthorized(context.token)) {
          return await Question.findBySectionId(reference, context, sectionId);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    question: async (_, { questionId }, context: MyContext): Promise<Question> => {
      try {
        if (isAuthorized(context.token)) {
          return await Question.findById('section resolver', context, questionId);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in question resolver');
        throw InternalServerError();
      }
    }
  },
  Mutation: {
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
            required
          });

          // create the new question
          const newQuestion = await question.create(context);

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

            // Return newly created question
            return await Question.findById(reference, context, questionId);
          }
          // Otherwise it had errors so return it as-is
          return newQuestion;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    updateQuestion: async (_, { input: {
      questionId,
      displayOrder,
      questionText,
      requirementText,
      guidanceText,
      sampleText,
      required,
      questionOptions } }, context: MyContext): Promise<Question> => {

      const reference = 'updateQuestion resolver';
      try {
        // Get Question based on provided questionId
        const questionData = await Question.findById(reference, context, questionId);

        // Throw Not Found error if Question is not found
        if (!questionData) throw NotFoundError('Question not found');

        // Check that user has permission to update this question
        if (isAdmin(context.token) && await hasPermissionOnSection(context, questionData.templateId)) {
          const question = new Question({
            id: questionId,
            sectionId: questionData.sectionId,
            templateId: questionData.templateId,
            createdById: questionData.createdById,
            displayOrder: displayOrder,
            questionTypeId: questionData.questionTypeId,
            questionText: questionText,
            requirementText: requirementText,
            guidanceText: guidanceText,
            sampleText: sampleText,
            required: required,
            isDirty: questionData.isDirty
          });

          const updatedQuestion = await question.update(context);

          // If there are errors than throw a Bad User Input error
          if (updatedQuestion && !updatedQuestion.hasErrors()) {
            // Get existing questionOptions
            const existingQuestionOptions = await QuestionOption.findByQuestionId(reference, context, questionId);

            // Create a Map of existing options for quick lookup by ID or unique identifier
            const existingOptionsMap = new Map(existingQuestionOptions.map(option => [option.id, option]));

            // Separate incoming options into "to update" and "to create"
            const optionsToUpdate = [];
            const optionsToCreate = [];

            questionOptions.forEach(option => {
              if (existingOptionsMap.has(option.questionOptionId)) {
                // Add to update list, merging the new data with the existing data
                optionsToUpdate.push({ ...existingOptionsMap.get(option.questionOptionId), ...option });
              } else {
                // Add to create list
                optionsToCreate.push({ questionId, ...option });
              }
            });

            // Update existing options
            if (optionsToUpdate.length > 0) {
              await Promise.all(
                optionsToUpdate.map(async option => {
                  const questionOption = new QuestionOption(option);
                  await questionOption.update(context); // Call your update method
                })
              );
            }

            // Create new options
            if (optionsToCreate.length > 0) {
              await Promise.all(
                optionsToCreate.map(async option => {
                  const questionOption = new QuestionOption(option);
                  await questionOption.create(context); // Call your create method
                })
              );
            }

            // Return newly updated question
            return await Question.findById(reference, context, updatedQuestion.id);
          }

          //otherwise it had errors so return it as-is
          return updatedQuestion;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    removeQuestion: async (_, { questionId }, context: MyContext): Promise<Question> => {
      const reference = 'removeQuestion resolver';
      try {
        // Retrieve existing Question
        const questionData = await Question.findById(reference, context, questionId);

        // Throw Not Found error if Question is not found
        if (!questionData) throw NotFoundError('Question not found');

        // if the user is an admin and has permission on the section
        if (isAdmin(context.token) && await hasPermissionOnSection(context, questionData.templateId)) {
          //Need to create a new instance of Question so that it recognizes the 'delete' function of that instance
          const question = new Question({ ...questionData, id: questionId });
          // The delete will also delete all associated questionOptions
          return await question.delete(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
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
