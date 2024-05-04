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
function handleMutationError(err) {
  console.log(err);
  return {
    code: 400,
    success: false,
    message: err?.sqlMessage || 'Fatal error occurred while trying to run the query.',
    contributorRole: null,
  };
}

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: (_, __, { dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contributorRoles ORDER BY label';
        dataSources.sqlDataSource.query(sql, [])
          .then(rows => resolve(rows))
          .catch(error => reject(error));
      });
    },
    // returns a contributor role that matches the specified ID
    contributorRoleById: (_, { contributorRoleId }, { dataSources }) => {
      return new Promise((resolve, reject) => {
        fetchContributorRole(dataSources, contributorRoleId)
          .then(rows => resolve(rows[0]))
          .catch(error => reject(error));
      });
    },
    // returns the contributor role that matches the specified URL
    contributorRoleByURL: (_, { contributorRoleURL }, { dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contributorRoles WHERE url = ?';
        dataSources.sqlDataSource.query(sql, [contributorRoleURL])
          .then(rows => resolve(rows[0]))
          .catch(error => reject(error));
      });
    },
  },

  Mutation: {
    // add a new ContributorRole
    addContributorRole: (_, { url, label, displayOrder, description }, { dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO contributorRoles (url, label, description, displayOrder) VALUES (?, ?, ?)';
        dataSources.sqlDataSource.query(sql, [url, label, description, displayOrder])
          .then(rows => {
            resolve({
              code: 201,
              success: true,
              message: `Successfully added ContributorRole ${rows.insertId}`,
              contributorRole: fetchContributorRole(dataSources, rows.insertId),
            });
          })
          .catch(error => reject(handleMutationError(error)));
      });
    },
    updateContributorRole: (_, { id, url, label, displayOrder, description }, { dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'UPDATE contributorRoles SET url = ?, label = ?, description = ?, displayOrder = ?) WHERE id = ?';
        dataSources.sqlDataSource.query(sql, [url, label, description, displayOrder, id])
          .then(rows => {
            resolve({
              code: 200,
              success: true,
              message: `Successfully updated ContributorRole ${id}`,
              contributorRole: fetchContributorRole(dataSources, id),
            });
          })
          .catch(error => reject(handleMutationError(error)));
      });
    },
    removeContributorRole: (_, { id }, { dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM contributorRoles WHERE id = ?';
        const original = fetchContributorRole(dataSources, id);
        dataSources.sqlDataSource.query(sql, [id])
          .then(rows => {
            resolve({
              code: 200,
              success: true,
              message: `Successfully removed ContributorRole ${id}`,
              contributorRole: original,
            });
          })
          .catch(error => reject(handleMutationError(error)));
      });
    },
  },
};
