
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { ContributorRoleModel } from "../models/ContributorRole";

// Extracting this particular query because we call it after mutations
async function fetchContributorRole(dataSources, contributorRoleId) : Promise<ContributorRoleModel> {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM contributorRoles WHERE id = ?';
    dataSources.sqlDataSource.query(sql, [contributorRoleId])
                               .then(rows => resolve(rows[0]))
                               .catch(error => reject(error));
  });
}

// Generic error handler for mutations
function handleMutationError(logger, args) {
  const errorLogger = logger.child({ ...args })
  errorLogger.error(`ERROR: Resolving a ContributorRole query/mutation - ${args?.err?.sqlMessage}`);

  return {
    code: 400,
    success: false,
    message: args?.err?.sqlMessage || 'Fatal error occurred while trying to run the query.',
    contributorRole: null,
  };
}

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: (_, __, { logger, dataSources }) => {
      console.log('WHY!?');

      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contributorRoles ORDER BY label';
        const logMessage = 'Resolving query contributorRoles';

        dataSources.sqlDataSource.query(sql, [])
          .then(rows => {
            formatLogMessage(logger).debug(logMessage);
            resolve(rows)
          })
          .catch(err => {
            handleMutationError(logger, { err });
            reject(err)
          });
      });
    },
    // returns a contributor role that matches the specified ID
    contributorRoleById: (_, { contributorRoleId }, { logger, dataSources }) => {
      return new Promise((resolve, reject) => {
        const logMessage = `Resolving query contributorRoleById(id: '${contributorRoleId}')`
        fetchContributorRole(dataSources, contributorRoleId)
          .then(rows => {
            formatLogMessage(logger, { contributorRoleId }).debug(logMessage);
            resolve(rows[0])
          })
          .catch(err => {
            handleMutationError(logger, { err, contributorRoleId });
            reject(err);
          });
      });
    },
    // returns the contributor role that matches the specified URL
    contributorRoleByURL: (_, { contributorRoleURL }, { logger, dataSources }) => {
      return new Promise((resolve, reject) => {
        const url: string = contributorRoleURL.toString();
        const sql = 'SELECT * FROM contributorRoles WHERE url = ?';
        const logMessage = `Resolved query contributorRoleByURL(url: '${url}')`
        dataSources.sqlDataSource.query(sql, [url])
          .then(rows => {
            formatLogMessage(logger, { contributorRoleURL }).debug(logMessage);
            resolve(rows[0]);
          })
          .catch(err => {
            handleMutationError(logger, { err, contributorRoleURL });
            reject(err);
          });
      });
    },
  },

  Mutation: {
    // add a new ContributorRole
    addContributorRole: (_, { url, label, displayOrder, description }, { logger, dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO contributorRoles (url, label, description, displayOrder) VALUES (?, ?, ?, ?)';
        const logArgs = { url, label, displayOrder, description };
        const logMessage = `Resolving mutation addContributorRole`;
        dataSources.sqlDataSource.query(sql, [url, label, description, displayOrder])
          .then(rows => {
            formatLogMessage(logger, logArgs).debug(logMessage);
            resolve({
              code: 201,
              success: true,
              message: `Successfully added ContributorRole ${rows.insertId}`,
              contributorRole: fetchContributorRole(dataSources, rows.insertId),
            });
          })
          .catch(err => reject(handleMutationError(logger, { err, ...logArgs })));
      });
    },
    updateContributorRole: (_, { id, url, label, displayOrder, description }, { logger, dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'UPDATE contributorRoles SET url = ?, label = ?, description = ?, displayOrder = ?) WHERE id = ?';
        const logArgs = { id, url, label, displayOrder, description };
        const logMessage = `Resolving mutation updateContributorRole`;
        dataSources.sqlDataSource.query(sql, [url, label, description, displayOrder, id])
          .then(rows => {
            formatLogMessage(logger, logArgs).debug(logMessage);
            resolve({
              code: 200,
              success: true,
              message: `Successfully updated ContributorRole ${id}`,
              contributorRole: fetchContributorRole(dataSources, id),
            });
          })
          .catch(err => reject(handleMutationError(logger, { err, ...logArgs })));
      });
    },
    removeContributorRole: (_, { id }, { logger, dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM contributorRoles WHERE id = ?';
        const logMessage = `Resolving mutation removeContributorRole`;
        const original = fetchContributorRole(dataSources, id);
        dataSources.sqlDataSource.query(sql, [id])
          .then(rows => {
            formatLogMessage(logger, { id }).debug(logMessage);
            resolve({
              code: 200,
              success: true,
              message: `Successfully removed ContributorRole ${id}`,
              contributorRole: original,
            });
          })
          .catch(err => reject(handleMutationError(logger, { err, id })));
      });
    },
  },
};
