import { Resolvers } from "../types";

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: (_, __, { dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contributor_roles ORDER BY label';
        dataSources.mysqlDataSource.query(sql, [])
                                   .then(rows => resolve(rows))
                                   .catch(error => reject(error));
      });
    },
    // returns a contributor role that matches the specified ID
    contributorRoleById: (_, { contributorRoleId }, { dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contributor_roles WHERE id = ?';
        dataSources.mysqlDataSource.query(sql, [contributorRoleId])
                                   .then(rows => resolve(rows[0]))
                                   .catch(error => reject(error));
      });
    },
    // returns the contributor role that matches the specified URL
    contributorRoleByURL: (_, { contributorRoleURL }, { dataSources }) => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM contributor_roles WHERE url = ?';
        dataSources.mysqlDataSource.query(sql, [contributorRoleURL])
                                   .then(rows => resolve(rows[0]))
                                   .catch(error => reject(error));
      });
    },
  },
};
