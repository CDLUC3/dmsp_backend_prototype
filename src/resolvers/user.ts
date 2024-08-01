
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { MyContext } from '../context';

export const resolvers: Resolvers = {
  Query: {
    // returns the current user
    me: async (_, __, { logger, token }: MyContext) => {
      const logMessage = 'Resolving query me';
      const user = null;
      // Hard coding for testing for now. Change this out to get the email from the token
      // const user = User.findByEmail('orgA.user@example.com');
      return user;
    },

    // Should only be callable by an Admin. Super returns all users, Admin gets only
    // the users associated with their affiliationId
    users: async (_, __, { logger, dataSources }) => {
      const logMessage = `Resolving query users`
      try {
        const sql = 'SELECT id, givenName, surName, email, role, created, modified \
                     FROM users ORDER BY created DESC';

        const resp = await dataSources.sqlDataSource.query(sql, []);
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
  },
};
