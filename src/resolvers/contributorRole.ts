import { Resolvers } from "../types";

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: (_, __, { dataSources }) => {
      const sql = 'SELECT * FROM contributor_roles ORDER BY label';
      return dataSources.postgresDataSource.query(sql, []);
    },
    // returns a contributor role that matches the specified ID
    contributorRoleById: (_, { contributorRoleId }, { dataSources }) => {
      const sql = 'SELECT * FROM contributor_roles WHERE id = $1';
      return dataSources.postgresDataSource.query(sql, [encodeURIComponent(contributorRoleId)])[0];
    },
    // returns the contributor role that matches the specified URL
    contributorRoleByURL: (_, { contributorRoleURL }, { dataSources }) => {
      const sql = 'SELECT * FROM contributor_roles WHERE url = $1';
      return dataSources.postgresDataSource.query(sql, [encodeURIComponent(contributorRoleURL)])[0];
    },
  },
};
