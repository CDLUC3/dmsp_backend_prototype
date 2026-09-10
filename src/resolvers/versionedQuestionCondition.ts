import { Resolvers } from "../types.js";
import { MyContext } from "../context.js";
import { VersionedQuestionCondition } from "../models/VersionedQuestionCondition.js";
import { VersionedQuestionConditionGroup } from "../models/VersionedQuestionConditionGroups.js";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors.js";
import { prepareObjectForLogs } from "../logger.js";
import { isAuthorized } from "../services/authService.js";
import { GraphQLError } from "graphql";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";

export const resolvers: Resolvers = {
  Query: {
    // return all published condition groups (and their nested
    // conditions) for the specified versioned question
    publishedConditionGroupsForQuestion: async (_, { versionedQuestionId }, context: MyContext): Promise<VersionedQuestionConditionGroup[]> => {
      const reference = 'publishedConditionGroupsForQuestion resolver';
      try {
        if (isAuthorized(context.token)) {
          return await VersionedQuestionConditionGroup.findByVersionedQuestionId(reference, context, versionedQuestionId);
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

  VersionedQuestionConditionGroup: {
    conditions: async (parent, _, context: MyContext) => {
      if (isNullOrUndefined(parent.id)) {
        throw InternalServerError();
      }
      return await VersionedQuestionCondition.findByVersionedQuestionConditionGroupId(
        'VersionedQuestionConditionGroup.conditions resolver',
        context,
        parent.id
      );
    },
    // `parent` is contextually typed as the generated type (not the model class) here,
    // which is all `created`/`modified` need.
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },

  VersionedQuestionCondition: {
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },
};
