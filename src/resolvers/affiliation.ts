import { Resolvers } from "../types";
import { MyContext } from '../context';
import { Affiliation, AffiliationSearch, AffiliationType } from '../models/Affiliation';
import { isAdmin, isSuperAdmin } from "../services/authService";
import { BadRequestError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors";
import { formatLogMessage } from "../logger";

export const resolvers: Resolvers = {
  Query: {

    affiliationTypes: async (): Promise<string[]> => {
      return Object.values(AffiliationType);
    },

    // returns an array of Affiliations that match the search criteria
    affiliations: async (_, { name, funderOnly }, context: MyContext): Promise<AffiliationSearch[]> => {
      return AffiliationSearch.search(context, { name, funderOnly });
    },

    // Returns the specified Affiliation
    affiliationById: async (_, { affiliationId }, context: MyContext): Promise<Affiliation> => {
      return Affiliation.findById('Query affiliationById', context, affiliationId);
    },

    // Returns the specified Affiliation
    affiliationByURI: async (_, { uri }, context: MyContext): Promise<Affiliation> => {
      return Affiliation.findByURI('Query affiliationByURI', context, uri);
    },
  },

  Mutation: {
    // Create a new Affiliation
    addAffiliation: async (_, { input }, context: MyContext): Promise<Affiliation> => {
      try {
        const affiliation = new Affiliation(input);
        return await affiliation.create(context);
      } catch(err) {
        formatLogMessage(context.logger).error(err, 'Failure in addAffiliation rsolver');
        throw InternalServerError();
      }
    },

    // Update an Affiliation
    updateAffiliation: async (_, { input }, context: MyContext): Promise<Affiliation> => {
      try {
        // If the current user is a superAdmin or an Admin and this is their Affiliation
        if (isSuperAdmin(context.token) || (isAdmin(context.token) && context.token.uri === input.uri)) {
          const existing = await Affiliation.findByURI('updateAffiliation resolver', context, input.uri);
          // If the URI already exists, throw an error
          if (existing) {
            throw BadRequestError('Affiliation already exists');
          }

          const affiliation = new Affiliation(input);
          return await affiliation.create(context);
        }
        throw ForbiddenError();
      } catch(err) {
        formatLogMessage(context.logger).error(err, 'Failure in updateAffiliation rsolver');
        throw InternalServerError();
      }
    },

    // Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL)
    removeAffiliation: async (_, { affiliationId }, context: MyContext): Promise<Affiliation> => {
      try {
        // If the current user is a superAdmin
        if (isSuperAdmin(context.token)) {
          const affiliation = await Affiliation.findById('removeAffiliation resolver', context, affiliationId);
          if (affiliation) {
            return await affiliation.delete(context);
          }
        }
        throw ForbiddenError();
      } catch(err) {
        formatLogMessage(context.logger).error(err, 'Failure in removeAffiliation rsolver');
        throw InternalServerError();
      }
    },
  }
}
