
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
    contributorRoles: async (_, __, context: MyContext): Promise<ContributorRole[] | null> => {
      return await ContributorRole.all('contributorRoles resolver', context);
    },

    // returns a contributor role that matches the specified ID
    contributorRoleById: async (_, { contributorRoleId }, context: MyContext): Promise<ContributorRole | null> => {
      return await ContributorRole.findById('contributorRoleById resolver', context, contributorRoleId);
    },

    // returns the contributor role that matches the specified URL
    contributorRoleByURL: async (_, { contributorRoleURL }, context: MyContext): Promise<ContributorRole | null> => {
      return await ContributorRole.findByURL('contributorRoleByURL resolver', context, contributorRoleURL);
    },
  },

  Mutation: {
    // add a new ContributorRole
    addContributorRole: async (_, { url, label, displayOrder, description }, { logger, dataSources }) => {
      const logArgs = { url, label, displayOrder, description };
      const logMessage = `Resolving mutation addContributorRole`;

      try {
        const sql = 'INSERT INTO contributorRoles (url, label, description, displayOrder) VALUES (?, ?, ?)';
        const resp = await dataSources.sqlDataSource.query(sql, [url, label, description, displayOrder]);

        formatLogMessage(logger, logArgs).debug(logMessage);

        const contributor = await fetchContributorRole(dataSources, resp.id);

        return {
          code: 201,
          success: true,
          message: `Successfully added ContributorRole ${resp.id}`,
          contributorRole: contributor
        };
      } catch (err) {
        return handleMutationError(logger, { err, ...logArgs });
      }
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
