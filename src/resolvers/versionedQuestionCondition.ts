import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { Question } from "../models/Question";
import { hasPermissionOnQuestion } from "../services/questionService";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors";
import { formatLogMessage } from "../logger";
import { isAdmin } from "../services/authService";
import { GraphQLError } from "graphql";


export const resolvers: Resolvers = {
  Query: {
    // return all forcibly published conditions for the specified versioned question
    publishedConditionsForQuestion: async (_, { versionedQuestionId }, context: MyContext): Promise<VersionedQuestionCondition[]> => {
      const reference = 'publishedConditionsForQuestion resolver';
      try {
        if (isAdmin(context.token)) {
          // Grab the versionedQuestion so we can get the question, and then the templateId
          const versionedQuestion = await VersionedQuestion.findById(reference, context, versionedQuestionId);
          const question = await Question.findById(reference, context, versionedQuestion.questionId);

          if (await hasPermissionOnQuestion(context, question.templateId)) {
            return await VersionedQuestionCondition.findByVersionedQuestionId(reference, context, versionedQuestionId);
          }
        }
        context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
};
