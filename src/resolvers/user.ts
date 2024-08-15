import { Resolvers } from "../types";
import { MyContext } from '../context';
import { User } from '../models/User';
import { Affiliation } from '../models/Affiliation';

export const resolvers: Resolvers = {
  Query: {
    // returns the current User
    me: async (_, __, context: MyContext): Promise<User | null> => {
      // TODO: remove this hard-coded email once the User is in the context (replace with findById)
      const email = 'orgA.admin@example.com';
      return await User.findByEmail('user resolver', context, email);
    },

    // Should only be callable by an Admin. Super returns all users, Admin gets only
    // the users associated with their affiliationId
    users: async (_, __, context): Promise<User[] | null> => {
      // TODO: remove this hard-coded affiliationId once the User is in the context
      const affiliationId = 'https://ror.org/01nrxwf90';
      return await User.findByAffiliationId('users resolver', context, affiliationId)
    },

    // This query should only be available to Admins. Super can get any user and Admin can get
    // only users associated with their affiliationId
    user: async (_, { userId }, context: MyContext): Promise<User | null> => {
      return await User.findById('user resolver', context, userId);
    },
  },

  User: {
    // Chained resolver to fetch the Affiliation info for the user
    affiliation: async (parent: User, _, context): Promise<Affiliation | null> => {
      return Affiliation.findById('Chained User.affiliation', context, parent.affiliationId);
    },
  },
};
