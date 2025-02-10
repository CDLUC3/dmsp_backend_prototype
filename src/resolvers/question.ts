import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionOption } from "../models/QuestionOption";
import { Question } from "../models/Question";
import { Section } from "../models/Section";
import { getQuestionOptionsToRemove, hasPermissionOnQuestion } from "../services/questionService";
import { BadUserInputError, ForbiddenError, NotFoundError } from "../utils/graphQLErrors";
import { QuestionCondition } from "../models/QuestionCondition";


export const resolvers: Resolvers = {
  Query: {
    questions: async (_, { sectionId }, context: MyContext): Promise<Question[]> => {
      const section = await Section.findById('questions resolver', context, sectionId);
      if (await hasPermissionOnQuestion(context, section.templateId)) {
        return await Question.findBySectionId('questions resolver', context, sectionId);
      }
      throw ForbiddenError();
    },
    question: async (_, { questionId }, context: MyContext): Promise<Question> => {

      // Find question with questionId
      const question = await Question.findById('section resolver', context, questionId);

      if (await hasPermissionOnQuestion(context, question.templateId)) {
        return question;
      }
      throw ForbiddenError();
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
      useSampleTextAsDefault,
      required,
      questionOptions } }, context: MyContext): Promise<Question> => {

      if (await hasPermissionOnQuestion(context, templateId)) {

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

        // If there are errors than throw a Bad User Input error
        if (newQuestion.errors) {
          const errorMessages = newQuestion.errors.join(', ');
          throw BadUserInputError(errorMessages);
        } else {
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
          return await Question.findById('addQuestion resolver', context, questionId);
        }
      }
      throw ForbiddenError();
    },
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

      // Get Question based on provided questionId
      const questionData = await Question.findById('updateQuestion resolver', context, questionId);

      // Throw Not Found error if Question is not found
      if (!questionData) {
        throw NotFoundError('Question not found')
      }

      // Check that user has permission to update this question
      if (await hasPermissionOnQuestion(context, questionData.templateId)) {
        const question = new Question({
          id: questionId,
          sectionId: questionData.sectionId,
          templateId: questionData.templateId,
          createdById: questionData.createdById,
          displayOrder: displayOrder,
          questionTypeId: questionTypeId || questionData.questionTypeId,
          questionText: questionText,
          requirementText: requirementText,
          guidanceText: guidanceText,
          sampleText: sampleText,
          useSampleTextAsDefault: useSampleTextAsDefault,
          required: required,
          isDirty: questionData.isDirty
        });

        const updatedQuestion = await question.update(context);

        // If there are errors than throw a Bad User Input error
        if (updatedQuestion.errors) {
          const errorMessages = updatedQuestion.errors.join(', ');
          throw BadUserInputError(errorMessages);
        } else {

          // Get existing questionOptions
          const existingQuestionOptions = await QuestionOption.findByQuestionId('question resolver', context, questionId);

          // Create a Map of existing options for quick lookup by ID or unique identifier
          const existingOptionsMap = new Map(
            existingQuestionOptions.map(option => [option.id, option])
          );


          // Get list of options that need to be removed
          const optionsToRemove = await getQuestionOptionsToRemove(questionOptions as QuestionOption[], context, questionId);

          // Remove question options that are no longer in the updated questionOptions array
          if (optionsToRemove.length > 0) {
            await Promise.all(
              optionsToRemove.map(async (option) => {
                const questionOption = new QuestionOption({
                  questionId: option.questionId,
                  id: option.id
                });

                await questionOption.delete(context);
              })
            );
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
          return await Question.findById('updateQuestion resolver', context, updatedQuestion.id);
        }
      }
      throw ForbiddenError();
    },
    removeQuestion: async (_, { questionId }, context: MyContext): Promise<Question> => {
      // Retrieve existing Question
      const questionData = await Question.findById('removeQuestion resolver', context, questionId);

      // Throw Not Found error if Question is not found
      if (!questionData) {
        throw NotFoundError('Question not found')
      }

      if (await hasPermissionOnQuestion(context, questionData.templateId)) {
        //Need to create a new instance of Question so that it recognizes the 'delete' function of that instance
        const question = new Question({
          ...questionData,
          id: questionId
        });

        // The delete will also delete all associated questionOptions
        return await question.delete(context);
      }

      throw ForbiddenError();
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
