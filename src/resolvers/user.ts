
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { MyContext } from '../context';
import { User } from '../models/User';
import { Affiliation } from '../models/Affiliation';

export const resolvers: Resolvers = {
  Query: {
    // returns the current User
    me: async (_, __, { logger }: MyContext) => {
      formatLogMessage(logger).debug('Resolving query me');
      // Hard coding for testing for now. Change this out to get the email from the token
      const user = null;
      // const user = User.findByEmail('orgA.user@example.com');
      if (user) {
        return user;
      }
      return {
        code: 401,
        success: false,
        message: 'Unauthorized',
        user: null,
      };
    },

    // Should only be callable by an Admin. Super returns all users, Admin gets only
    // the users associated with their affiliationId
    users: async (_, __, { logger, dataSources }) => {
      const logMessage = `Resolving query users`
      try {
        const sql = 'SELECT id, givenName, surName, email, role, affiliationId, created, modified \
                     FROM users ORDER BY created DESC'
        const resp = await dataSources.sqlDataSource.query(sql);
        formatLogMessage(logger).debug(logMessage);
        return resp;
      } catch (err) {
        return {
          code: 500,
          success: false,
          message: 'Fatal error occurred while trying to run the query.',
          users: null,
        };
      }
    },

    // This query should only be available to Admins. Super can get any user and Admin can get
    // only users associated with their affiliationId
    user: async (_, { userId }, context: MyContext): Promise<User | null> => {
      return await User.findById(`user resolver`, context, userId);
    },
  },

  User: {
    // Chained resolver to fetch the Affiliation info for the user
    affiliation: async (parent: User, _, context) => {
      return Affiliation.findById('Chained User.affiliation', context, parent.affiliationId);
    },
  },
};
