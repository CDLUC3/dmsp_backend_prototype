import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionOption } from "../models/QuestionOption";
import { NotFoundError, BadUserInputError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
  Query: {
    questionOptions: async (_, { questionId }, context: MyContext): Promise<QuestionOption[]> => {
      return await QuestionOption.findByQuestionId('questionOption resolver', context, questionId);
    },
    questionOption: async (_, { id }, context: MyContext): Promise<QuestionOption> => {
      return await QuestionOption.findByQuestionOptionId('questionOption resolver', context, id);
    },
  },
  Mutation: {
    addQuestionOption: async (_, { input: {
      questionId,
      text,
      orderNumber,
      isDefault } }, context: MyContext): Promise<QuestionOption> => {

      const questionOption = new QuestionOption({
        questionId,
        text,
        orderNumber,
        isDefault
      });

      // create the new QuestionOption
      const newQuestionOption = await questionOption.create(context);

      // If there are errors than throw a Bad User Input error
      if (newQuestionOption.errors) {
        const errorMessages = newQuestionOption.errors.join(', ');
        throw BadUserInputError(errorMessages);
      } else {
        const questionOptionId = newQuestionOption.id;

        // Return newly created questionOption
        return await QuestionOption.findByQuestionOptionId('questionOption resolver', context, questionOptionId);
      }
    },
    updateQuestionOption: async (_, { input: {
      id,
      text,
      orderNumber,
      isDefault } }, context: MyContext): Promise<QuestionOption> => {

      // Get QuestionOption based on provided questionOptionId
      const questionOptionData = await QuestionOption.findByQuestionOptionId('questionOption resolver', context, id);

      // Throw Not Found error if QuestionOption data is not found
      if (!questionOptionData) {
        throw NotFoundError('QuestionOption not found')
      }

      const questionOption = new QuestionOption({
        id: questionOptionData.id,
        questionId: questionOptionData.questionId,
        text: text || questionOptionData.text,
        orderNumber: orderNumber || questionOptionData.orderNumber,
        isDefault: isDefault || questionOptionData.isDefault
      });

      const updatedQuestionOption = await questionOption.update(context);

      // If there are errors than throw a Bad User Input error
      if (updatedQuestionOption.errors) {
        const errorMessages = updatedQuestionOption.errors.join(', ');
        throw BadUserInputError(errorMessages);
      } else {
        // Return newly created question
        return await QuestionOption.findByQuestionOptionId('updateQuestion resolver', context, updatedQuestionOption.id);
      }
    },
  },
};
