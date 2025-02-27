import { Resolvers } from "../types";
import { ResearchDomain } from "../models/ResearchDomain";
import { MyContext } from '../context';
import { AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { formatLogMessage } from "../logger";
import { isAuthorized } from "../services/authService";
import { GraphQLError } from "graphql";

export const resolvers: Resolvers = {
  Query: {
    // return all of the top level research domains
    topLevelResearchDomains: async (_, __, context: MyContext): Promise<ResearchDomain[]> => {
      const reference = 'topLevelResearchDomains resolver';
      try {
        if (isAuthorized(context.token)) {
          return await ResearchDomain.topLevelDomains(reference, context);
        }
        throw AuthenticationError();
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
        throw AuthenticationError();
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
  },
};

