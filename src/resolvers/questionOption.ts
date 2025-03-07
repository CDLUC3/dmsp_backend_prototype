import { Resolvers } from "../types";
import { MyContext } from "../context";
import { QuestionOption } from "../models/QuestionOption";
import { NotFoundError, InternalServerError, ForbiddenError, AuthenticationError } from "../utils/graphQLErrors";
import { formatLogMessage } from "../logger";
import { isAdmin } from "../services/authService";
import { hasPermissionOnQuestion } from "../services/questionService";
import { GraphQLError } from "graphql";


export const resolvers: Resolvers = {
  Query: {
    // return all of the questionOptions for the specified question
    questionOptions: async (_, { questionId }, context: MyContext): Promise<QuestionOption[]> => {
      const reference = 'questionOptions resolver';
      try {
        return await QuestionOption.findByQuestionId(reference, context, questionId);
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a specific questionOption
    questionOption: async (_, { id }, context: MyContext): Promise<QuestionOption> => {
      const reference = 'questionOption resolver';
      try {
        return await QuestionOption.findByQuestionOptionId(reference, context, id);
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
  Mutation: {
    // add a new questionOption
    addQuestionOption: async (_, { input: {
      questionId,
      text,
      orderNumber,
      isDefault } }, context: MyContext): Promise<QuestionOption> => {

      const reference = 'addQuestionOption resolver';
      try {
        const questionOption = new QuestionOption({
          questionId,
          text,
          orderNumber,
          isDefault
        });

        // if the user is an admin and has permission on the question
        if (isAdmin(context.token) && await hasPermissionOnQuestion(context, questionId)) {
          const newQuestionOption = await questionOption.create(context);

          if (newQuestionOption?.id) {
            return newQuestionOption;
          }

          // A null was returned so add a generic error and return it
          if (!questionOption.errors['general']) {
            questionOption.addError('general', 'Unable to create Affiliation');
          }
          return questionOption;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing questionOption
    updateQuestionOption: async (_, { input: {
      id,
      text,
      orderNumber,
      isDefault } }, context: MyContext): Promise<QuestionOption> => {

      const reference = 'updateQuestionOption resolver';
      try {
        // Get QuestionOption based on provided questionOptionId
        const questionOptionData = await QuestionOption.findByQuestionOptionId(reference, context, id);

        // Throw Not Found error if QuestionOption data is not found
        if (!questionOptionData) {
          throw NotFoundError('QuestionOption not found');
        }

        // If the user has permission on the Question
        if (isAdmin(context.token) || await hasPermissionOnQuestion(context, questionOptionData.questionId)) {
          const questionOption = new QuestionOption({
            id: id,
            questionId: questionOptionData.questionId,
            text: text || questionOptionData.text,
            orderNumber: orderNumber || questionOptionData.orderNumber,
            isDefault: isDefault || questionOptionData.isDefault
          });

          return await questionOption.update(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // remove an existing questionOption
    removeQuestionOption: async (_, { id }, context: MyContext): Promise<QuestionOption> => {
      const reference = 'removeQuestionOption resolver';
      try {
        // Retrieve existing questionOption
        const questionOptionData = await QuestionOption.findByQuestionOptionId(reference, context, id);

        // Throw Not Found error if QuestionOption is not found
        if (!questionOptionData) {
          throw NotFoundError('QuestionOption not found');
        }

        // If the user has permission on the Question
        if (isAdmin(context.token) && await hasPermissionOnQuestion(context, questionOptionData.questionId)) {
          //Need to create a new instance of QuestionOption so that it recognizes the 'delete' function of that instance
          const questionOption = new QuestionOption({
            ...questionOptionData,
            id
          });

          return await questionOption.delete(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
};
