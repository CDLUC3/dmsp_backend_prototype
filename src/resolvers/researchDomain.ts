import { Resolvers } from "../types";
import { ResearchDomain } from "../models/ResearchDomain";
import { MyContext } from '../context';
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors";
import { formatLogMessage } from "../logger";
import { isAuthorized } from "../services/authService";
import { GraphQLError } from "graphql";
import {formatISO9075} from "date-fns";

export const resolvers: Resolvers = {
  Query: {
    // return all of the top level research domains
    topLevelResearchDomains: async (_, __, context: MyContext): Promise<ResearchDomain[]> => {
      const reference = 'topLevelResearchDomains resolver';
      try {
        if (isAuthorized(context.token)) {
          return await ResearchDomain.topLevelDomains(reference, context);
        }
        // Unauthorized access
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return all of the child research domains for the specified parent domain
    childResearchDomains: async (_, { parentResearchDomainId }, context: MyContext): Promise<ResearchDomain[]> => {
      const reference = 'childResearchDomains resolver';
      try {
        if (isAuthorized(context.token)) {
          return await ResearchDomain.findByParentId(reference, context, parentResearchDomainId);
        }
        // Unauthorized access
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
  ResearchDomain: {
    parentResearchDomain: async (parent: ResearchDomain, _, context: MyContext): Promise<ResearchDomain | null> => {
      if (parent.parentResearchDomainId) {
        return await ResearchDomain.findById('ResearchDomain.parentResearchDomain', context, parent.parentResearchDomainId);
      }
      return null;
    },
    created: (parent: ResearchDomain) => {
      return formatISO9075(new Date(parent.created));
    },
    modified: (parent: ResearchDomain) => {
      return formatISO9075(new Date(parent.modified));
    }
  },
};
