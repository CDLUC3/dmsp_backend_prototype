import { Resolvers } from "../types";

export const resolvers: Resolvers = {
  Query: {
    // returns a DMSP that matches the specified DMP ID
    dmspById: (_, { dmspId }, { dataSources }) => {
      return new Promise((resolve, reject) => {
        dataSources.dmphubAPIDataSource.getDMSP(encodeURIComponent(dmspId))
          .then(rows => resolve(rows))
          .catch(error => reject(error));
      });
    },
  },
};
