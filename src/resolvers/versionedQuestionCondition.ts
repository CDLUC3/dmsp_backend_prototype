import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors";
import { prepareObjectForLogs } from "../logger";
import { isAuthorized } from "../services/authService";
import { GraphQLError } from "graphql";
import { normaliseDateTime } from "../utils/helpers";

export const resolvers: Resolvers = {
  Query: {
    // return all forcibly published conditions for the specified versioned question
    publishedConditionsForQuestion: async (_, { versionedQuestionId }, context: MyContext): Promise<VersionedQuestionCondition[]> => {
      const reference = 'publishedConditionsForQuestion resolver';
      try {
        if (isAuthorized(context.token)) {
          return await VersionedQuestionCondition.findByVersionedQuestionId(reference, context, versionedQuestionId);
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

  VersionedQuestionCondition: {
    created: (parent: VersionedQuestionCondition) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: VersionedQuestionCondition) => {
      return normaliseDateTime(parent.modified);
    }
  },
};
