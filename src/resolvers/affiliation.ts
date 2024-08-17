import { Resolvers } from "../types";
import { MyContext } from '../context';
import { Affiliation, AffiliationSearch } from '../models/Affiliation';

export const resolvers: Resolvers = {
  Query: {
    // returns an array of Affiliations that match the search criteria
    affiliations: async (_, { name, funderOnly }, context: MyContext): Promise<AffiliationSearch[]> => {
      return AffiliationSearch.search(context, { name, funderOnly });
    },

    // Returns the specified Affiliation
    affiliation: async (_, { affiliationId }, context: MyContext): Promise<Affiliation> => {
      return Affiliation.findById('Query affiliation', context, affiliationId);
    },
  }
}
