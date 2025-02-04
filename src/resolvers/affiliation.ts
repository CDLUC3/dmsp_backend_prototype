import { Resolvers } from "../types";
import { MyContext } from '../context';
import { Affiliation, AffiliationSearch, AffiliationType } from '../models/Affiliation';
import { isAdmin, isSuperAdmin } from "../services/authService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
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
        const created = await affiliation.create(context);

        // If an Affiliation was not returned add a generic error and return it
        if (!created?.id) {
          affiliation.addError('general', 'Unable to create Affiliation');
          return affiliation;
        }

        return created;
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in addAffiliation rsolver');
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
          if (!existing) throw NotFoundError();

          const affiliation = new Affiliation(input);
          // Since we pass around the URI for affiliations instead of the id we need to set it here
          if (!affiliation.id) affiliation.id = existing.id;

          return await affiliation.update(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in updateAffiliation resolver');
        throw InternalServerError();
      }
    },

    // Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL)
    removeAffiliation: async (_, { affiliationId }, context: MyContext): Promise<Affiliation> => {
      try {
        // If the current user is a superAdmin
        if (isSuperAdmin(context.token)) {
          const affiliation = await Affiliation.findById('removeAffiliation resolver', context, affiliationId);

          // If the URI already exists, throw an error
          if (!affiliation) throw NotFoundError();

          if (affiliation) return await affiliation.delete(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in removeAffiliation rsolver');
        throw InternalServerError();
      }
    },
  }
}
