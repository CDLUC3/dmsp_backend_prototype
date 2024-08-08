
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { MyContext } from '../context';
import { User } from '../models/User';

export const resolvers: Resolvers = {
  Query: {
    // returns the current User
    me: async (_, __, { logger, token }: MyContext) => {
      const logMessage = 'Resolving query me';
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
    user: async (_, { userId }, { logger }) => {
      const logMessage = `Resolving query user for id ${userId}`
      try {
        const user = await User.findById(userId);
        formatLogMessage(logger).debug(logMessage);
        return user;
      } catch (err) {
        formatLogMessage(logger).error(`Error fetching user ${userId} - ${err.message}`);
        return null;
      }
    },
  },

  User: {
    // Chained resolver to fetch the Affiliation info for the user
    affiliation: async (parent: User, _, { logger, dataSources }) => {
      const logMessage = 'Chaining resolver for affiliation';
      const rorId = parent.affiliationId.replace(/https?:\/\//g, '')
      try {
        formatLogMessage(logger).debug(logMessage);
        return dataSources.dmptoolAPIDataSource.getAffiliation(rorId);
      } catch(err) {
        formatLogMessage(logger).error(`Error fetching affiliation ${rorId} for user ${parent.id} - ${err.message}`);
        return null;
      }
    },
  },
};
