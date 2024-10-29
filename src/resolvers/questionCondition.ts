import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionCondition } from "../models/QuestionCondition";
import { NotFoundError, BadUserInputError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
  Query: {
    questionConditions: async (_, { questionId }, context: MyContext): Promise<QuestionCondition[]> => {
      return await QuestionCondition.findByQuestionId('sections resolver', context, questionId);
    },
  },
  Mutation: {
    addQuestionCondition: async (_, { input: {
      questionId,
      action,
      condition,
      conditionMatch,
      target } }, context: MyContext): Promise<QuestionCondition> => {

      const questionCondition = new QuestionCondition({
        questionId,
        action,
        condition,
        conditionMatch,
        target
      });

      // create the new QuestionCondition
      const newQuestionCondition = await questionCondition.create(context);

      // If there are errors than throw a Bad User Input error
      if (newQuestionCondition.errors) {
        const errorMessages = newQuestionCondition.errors.join(', ');
        throw BadUserInputError(errorMessages);
      } else {
        const questionConditionId = newQuestionCondition.id;

        // Return newly created questionCondition
        return await QuestionCondition.findById('addQuestion resolver', context, questionConditionId);
      }
    },
    updateQuestionCondition: async (_, { input: {
      questionConditionId,
      action,
      condition,
      conditionMatch,
      target } }, context: MyContext): Promise<QuestionCondition> => {

      // Get QuestionCondition based on provided questionConditionId
      const questionConditionData = await QuestionCondition.findById('updateQuestionCondition resolver', context, questionConditionId);

      // Throw Not Found error if QuestionConditionData is not found
      if (!questionConditionData) {
        throw NotFoundError('QuestionCondition not found')
      }

      const questionCondition = new QuestionCondition({
        id: questionConditionId,
        questionId: questionConditionData.questionId,
        action: action || questionConditionData.action,
        createdById: questionConditionData.createdById,
        condition: condition || questionConditionData.condition,
        conditionMatch: conditionMatch || questionConditionData.conditionMatch,
        target: target || questionConditionData.target
      });

      const updatedQuestionCondition = await questionCondition.update(context);

      // If there are errors than throw a Bad User Input error
      if (updatedQuestionCondition.errors) {
        const errorMessages = updatedQuestionCondition.errors.join(', ');
        throw BadUserInputError(errorMessages);
      } else {
        // Return newly created question
        return await QuestionCondition.findById('updateQuestion resolver', context, updatedQuestionCondition.id);
      }
    },
    removeQuestionCondition: async (_, { questionConditionId }, context: MyContext): Promise<QuestionCondition> => {
      // Retrieve existing questionCondition
      const questionConditionData = await QuestionCondition.findById('removeQuestion resolver', context, questionConditionId);

      // Throw Not Found error if QuestionCondition is not found
      if (!questionConditionData) {
        throw NotFoundError('QuestionCondition not found')
      }

      //Need to create a new instance of QuestionCondition so that it recognizes the 'delete' function of that instance
      const questionCondition = new QuestionCondition({
        ...questionConditionData,
        id: questionConditionId
      });

      return await questionCondition.delete(context);
    },
  },
};
