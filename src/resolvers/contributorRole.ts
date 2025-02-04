
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { ContributorRole } from "../models/ContributorRole";
import { MyContext } from '../context';
import { isSuperAdmin } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError } from '../utils/graphQLErrors';

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

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: async (_, __, context: MyContext): Promise<ContributorRole[]> => {
      return await ContributorRole.all('contributorRoles resolver', context);
    },

    // returns a contributor role that matches the specified ID
    contributorRoleById: async (_, { contributorRoleId }, context: MyContext): Promise<ContributorRole> => {
      return await ContributorRole.findById('contributorRoleById resolver', context, contributorRoleId);
    },

    // returns the contributor role that matches the specified URL
    contributorRoleByURL: async (_, { contributorRoleURL }, context: MyContext): Promise<ContributorRole> => {
      return await ContributorRole.findByURL('contributorRoleByURL resolver', context, contributorRoleURL);
    },
  },

  Mutation: {
    // add a new ContributorRole
    addContributorRole: async (_, { url, label, displayOrder, description }, context) => {
      const logArgs = { url, label, displayOrder, description };
      const logMessage = `Resolving mutation addContributorRole`;

      try {
        // If the current user is a superAdmin or an Admin and this is their Affiliation
        if (isSuperAdmin(context.token)) {
          const sql = 'INSERT INTO contributorRoles (url, label, description, displayOrder) VALUES (?, ?, ?)';
          const resp = await context.dataSources.sqlDataSource.query(context, sql, [url, label, description, displayOrder]);

          formatLogMessage(context).debug(logArgs, logMessage);

          return await fetchContributorRole(context.dataSources, resp.id);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in updateAffiliation resolver');
        throw InternalServerError();
      }
    },
    updateContributorRole: async (_, { id, url, label, displayOrder, description }, context) => {
      const logArgs = { id, url, label, displayOrder, description };
      const logMessage = `Resolving mutation updateContributorRole`;
      try {
        // If the current user is a superAdmin or an Admin and this is their Affiliation
        if (isSuperAdmin(context.token)) {
          const sql = 'UPDATE contributorRoles SET url = ?, label = ?, description = ?, displayOrder = ?) WHERE id = ?';
          await context.dataSources.sqlDataSource.query(context, sql, [url, label, description, displayOrder, id]);

          formatLogMessage(context).debug(logArgs, logMessage);
          return await fetchContributorRole(context.dataSources, id);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in updateAffiliation resolver');
        throw InternalServerError();
      }
    },
    removeContributorRole: async (_, { id }, context) => {
      const logMessage = `Resolving mutation removeContributorRole`;
      const original = fetchContributorRole(context.dataSources, id);
      try {
        // If the current user is a superAdmin or an Admin and this is their Affiliation
        if (isSuperAdmin(context.token)) {
          const sql = 'DELETE FROM contributorRoles WHERE id = ?';
          await context.dataSources.sqlDataSource.query(context, sql, [id]);

          formatLogMessage(context).debug({ id }, logMessage);
          return original;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, 'Failure in updateAffiliation resolver');
        throw InternalServerError();
      }
    },
  },
};
