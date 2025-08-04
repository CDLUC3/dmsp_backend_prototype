import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition";
import { prepareObjectForLogs } from "../logger";
import { isAuthorized } from "../services/authService";
import { GraphQLError } from "graphql";
import { normaliseDateTime } from "../utils/helpers";

export const resolvers: Resolvers = {
  Query: {
    // return all of the published questions for the specified versioned section
    publishedQuestions: async (_, { versionedSectionId }, context: MyContext): Promise<VersionedQuestion[]> => {
      const reference = 'publishedQuestions resolver';
      try {
        if (isAuthorized(context.token)) {
          return await VersionedQuestion.findByVersionedSectionId(reference, context, versionedSectionId);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    versionedQuestion: async (_, { versionedQuestionId }, context: MyContext): Promise<VersionedQuestion> => {
      const reference = 'publishedQuestion resolver';
      try {
        if (isAuthorized(context.token)) {
          return await VersionedQuestion.findById(reference, context, versionedQuestionId);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  VersionedQuestion: {
    // Chained resolver to return the VersionedQuestionConditionss associated with this VersionedQuestion
    versionedQuestionConditions: async (parent: VersionedQuestion, _, context: MyContext): Promise<VersionedQuestionCondition[]> => {
      return await VersionedQuestionCondition.findByVersionedQuestionId(
        'Chained VersionedQuestion.versionedQuestionConditions',
        context,
        parent.id
      );
    },
    created: (parent: VersionedQuestion) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: VersionedQuestion) => {
      return normaliseDateTime(parent.modified);
    }
  }
};
