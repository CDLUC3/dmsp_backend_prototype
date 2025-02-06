import { Resolvers } from "../types";
import { MyContext } from '../context';
import { Affiliation, AffiliationSearch, AffiliationType, DEFAULT_DMPTOOL_AFFILIATION_URL } from '../models/Affiliation';
import { isAdmin, isSuperAdmin } from "../services/authService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { formatLogMessage } from "../logger";
import { GraphQLError } from "graphql";

export const resolvers: Resolvers = {
  Query: {
    // get all affiliation types/categories
    affiliationTypes: async (): Promise<string[]> => {
      return Object.values(AffiliationType);
    },

    // returns an array of Affiliations that match the search criteria
    affiliations: async (_, { name, funderOnly }, context: MyContext): Promise<AffiliationSearch[]> => {
      const reference = 'affiliations resolver';
      try {
        return await AffiliationSearch.search(context, { name, funderOnly });
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Returns the specified Affiliation by id
    affiliationById: async (_, { affiliationId }, context: MyContext): Promise<Affiliation> => {
      const reference = 'affiliationById resolver';
      try {
        return await Affiliation.findById(reference, context, affiliationId);
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Returns the specified Affiliation by URI
    affiliationByURI: async (_, { uri }, context: MyContext): Promise<Affiliation> => {
      const reference = 'affiliationByURI resolver';
      try {
        return await Affiliation.findByURI(reference, context, uri);
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Mutation: {
    // Create a new Affiliation
    addAffiliation: async (_, { input }, context: MyContext): Promise<Affiliation> => {
      const reference = 'addAffiliation resolver';
      try {
        const affiliation = new Affiliation(input);
        const created = await affiliation.create(context);

        if (created?.id) {
          return created;
        }

        // A null was returned so add a generic error and return it
        if (!affiliation.errors['general']) {
          affiliation.addError('general', 'Unable to create Affiliation');
        }
        return affiliation;
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Update an Affiliation
    updateAffiliation: async (_, { input }, context: MyContext): Promise<Affiliation> => {
      const reference = 'updateAffiliation resolver';
      try {
        let existing = await Affiliation.findById(reference, context, input.id);
        existing = existing || await Affiliation.findByURI(reference, context, input.uri);

        // If the record doesn't exist
        if (!existing) {
          throw NotFoundError();
        }

        // If the current user is a superAdmin or an Admin and this is their Affiliation
        if (isSuperAdmin(context.token) || (isAdmin(context.token) && context.token.affiliationId === existing.uri)) {
          const affiliation = new Affiliation({ ...existing, ...input });

          // Since we pass around the URI for affiliations instead of the id we need to set it here
          if (!affiliation.id) {
            affiliation.id = existing.id;
          }

          return await affiliation.update(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL)
    removeAffiliation: async (_, { affiliationId }, context: MyContext): Promise<Affiliation> => {
      const reference = 'removeAffiliation resolver';
      try {
        // If the current user is a superAdmin
        if (isSuperAdmin(context.token)) {
          const affiliation = await Affiliation.findById(reference, context, affiliationId);

          // If the URI does not exist, throw an error
          if (!affiliation) {
            throw NotFoundError();
          }

          // If the affiliation is managed by the DMP Tool then we can delete it
          if (affiliation.uri.startsWith(DEFAULT_DMPTOOL_AFFILIATION_URL)) {
            return await affiliation.delete(context);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  }
}
