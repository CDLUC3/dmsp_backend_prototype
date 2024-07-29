
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { MyContext } from '../context';

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    me: async (_, __, { logger, token }: MyContext) => {
      const logMessage = 'Resolving query me';
      const user = null;
      //const user = User.findByEmail(token?.email)
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
    // returns a contributor role that matches the specified ID
    users: async (_, __, { logger, dataSources }) => {
      const logMessage = `Resolving query users`
      try {
        const sql = 'SELECT id, givenName, surName, email, role, created, modified \
                     FROM users ORDER BY created DESC'
        const resp = await dataSources.sqlDataSource.query(sql);
        formatLogMessage(logger).debug(logMessage);
        return resp[0];
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
