import { Resolvers } from "../types";

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: (_, __, { dataSources }) => {

console.log(dataSources.postgresDB);


      return dataSources.postgresDB.getContributorRoles();
    },
    // returns a contributor role that matches the specified ID
    contributorRoleById: (_, { contributorRoleId }, { dataSources }) => {
      return dataSources.postgresDB.getContributorRoleById(contributorRoleId);
    },
    // returns the contributor role that matches the specified URL
    contributorRoleByURL: (_, { contributorRoleURL }, { dataSources }) => {
      return dataSources.postgresDB.getContributorRoleByURL(contributorRoleURL);
    },
  },
};
