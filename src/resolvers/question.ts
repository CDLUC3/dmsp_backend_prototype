import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Question } from "../models/Question";
import { Section } from "../models/Section";
import { hasPermissionOnQuestion } from "../services/questionService";
import { ForbiddenError, NotFoundError, BadUserInputError } from "../utils/graphQLErrors";


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
      required } }, context: MyContext): Promise<Question> => {

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
          required
        });

        // create the new question
        const newQuestion = await question.create(context, questionText, sectionId, templateId,);

        // If there are errors than throw a Bad User Input error
        if (newQuestion.errors) {
          const errorMessages = newQuestion.errors.join(', ');
          throw BadUserInputError(errorMessages);
        } else {
          const questionId = newQuestion.id;

          // Return newly created question
          return await Question.findById('addQuestion resolver', context, questionId);
        }
      }
      throw ForbiddenError();
    },
    updateQuestion: async (_, { input: {
      questionId,
      displayOrder,
      questionText,
      requirementText,
      guidanceText,
      sampleText,
      required } }, context: MyContext): Promise<Question> => {

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
        if (updatedQuestion.errors) {
          const errorMessages = updatedQuestion.errors.join(', ');
          throw BadUserInputError(errorMessages);
        } else {
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

        return await question.delete(context);
      }
      throw ForbiddenError();
    },
    updateQuestionOptions: async (_, { questionId, required }, context: MyContext): Promise<Question> => {

      // Get Question based on provided questionId
      const questionData = await Question.findById('updateQuestionOptions resolver', context, questionId);

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
          displayOrder: questionData.displayOrder,
          questionTypeId: questionData.questionTypeId,
          questionText: questionData.questionText,
          requirementText: questionData.requirementText,
          guidanceText: questionData.guidanceText,
          sampleText: questionData.sampleText,
          required: required,
          isDirty: questionData.isDirty
        });

        const updatedQuestionOptions = await question.update(context);

        // If there are errors than throw a Bad User Input error
        if (updatedQuestionOptions.errors) {
          const errorMessages = updatedQuestionOptions.errors.join(', ');
          throw BadUserInputError(errorMessages);
        } else {
          // Return newly updated question
          return await Question.findById('updateQuestionOptions resolver', context, updatedQuestionOptions.id);
        }
      }
      throw ForbiddenError();
    },
  },
};
