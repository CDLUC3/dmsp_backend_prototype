import { Resolvers } from "../types";
import { ResearchDomain } from "../models/ResearchDomain";
import { MyContext } from '../context';

export const resolvers: Resolvers = {
  Query: {
    topLevelResearchDomains: async (_, __, context: MyContext): Promise<ResearchDomain[]> => {
      return await ResearchDomain.topLevelDomains('topLevelResearchDomains resolver', context);
    },

    childResearchDomains: async (_, { parentResearchDomainId }, context: MyContext): Promise<ResearchDomain[]> => {
      return await ResearchDomain.findByParentId('childResearchDomains resolver', context, parentResearchDomainId);
    },
  },
};
