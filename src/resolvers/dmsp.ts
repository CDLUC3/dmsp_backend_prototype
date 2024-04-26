import { Resolvers } from "../types";

export const resolvers: Resolvers = {
  Query: {
    // returns a DMSP that matches the specified DMP ID
    dmspById: (_, { dmspId }, { dataSources }) => {
      return dataSources.dmphubAPIDataSource.getDMSP(encodeURIComponent(dmspId));
    },
  },
};
