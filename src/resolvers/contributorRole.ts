
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { ContributorRole } from "../models/ContributorRole";
import { MyContext } from '../context';

// Extracting this particular query because we call it after mutations
async function fetchContributorRole(dataSources, contributorRoleId): Promise<ContributorRole> {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM contributorRoles WHERE id = ?';
    dataSources.sqlDataSource.query(sql, [contributorRoleId])
      .then(rows => {
        resolve(rows[0])
      })
      .catch(error => reject(error));
  });
}

// Generic error handler for mutations
function handleMutationError(logger, args) {
  formatLogMessage(logger, args)

  return {
    code: 400,
    success: false,
    message: args?.err?.message || 'Fatal error occurred while trying to run the query.',
    contributorRole: null,
  };
}

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: async (_, __, context: MyContext) => {
      return await ContributorRole.all('contributorRoles resolver', context);
    },

    // returns a contributor role that matches the specified ID
    contributorRoleById: async (_, { contributorRoleId }, context: MyContext) => {
      return await ContributorRole.findById('contributorRoleById resolver', context, contributorRoleId);
    },

    // returns the contributor role that matches the specified URL
    contributorRoleByURL: async (_, { contributorRoleURL }, context: MyContext) => {
      return await ContributorRole.findByURL('contributorRoleByURL resolver', context, contributorRoleURL);
    },
  },

  Mutation: {
    // add a new ContributorRole
    addContributorRole: async (_, options, context) => {
      // const contributorRole = new ContributorRole(options);
      // const inserted = await contributorRole.create('addContributorRole mutation', context);
      // return await ContributorRole.findById('addContributorRole mutation', context, inserted?.id);
      return null;
    },
    updateContributorRole: async (_, { id, url, label, displayOrder, description }, { logger, dataSources }) => {
      const logArgs = { id, url, label, displayOrder, description };
      const logMessage = `Resolving mutation updateContributorRole`;
      try {
        const sql = 'UPDATE contributorRoles SET url = ?, label = ?, description = ?, displayOrder = ?) WHERE id = ?';
        await dataSources.sqlDataSource.query(sql, [url, label, description, displayOrder, id]);

        formatLogMessage(logger, logArgs).debug(logMessage);
        return {
          code: 200,
          success: true,
          message: `Successfully updated ContributorRole ${id}`,
          contributorRole: fetchContributorRole(dataSources, id),
        };
      } catch (err) {
        return handleMutationError(logger, { err, ...logArgs });
      }
    },
    removeContributorRole: async (_, { id }, { logger, dataSources }) => {
      const logMessage = `Resolving mutation removeContributorRole`;
      const original = fetchContributorRole(dataSources, id);
      try {
        const sql = 'DELETE FROM contributorRoles WHERE id = ?';
        await dataSources.sqlDataSource.query(sql, [id]);

        formatLogMessage(logger, { id }).debug(logMessage);
        return {
          code: 200,
          success: true,
          message: `Successfully removed ContributorRole ${id}`,
          contributorRole: original,
        };
      } catch (err) {
        return handleMutationError(logger, { err, id });
      }
    },
  },
};
