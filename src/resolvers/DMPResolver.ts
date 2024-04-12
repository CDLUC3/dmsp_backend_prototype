import { Resolvers } from "../types";

export const resolvers: Resolvers = {
  Query: {
    // returns an array of Tracks that will be used to populate the homepage grid of our web client
    getDMP: (_, { dmpId }, { dataSources }) => {
      return dataSources.dmphubAPI.getDMP(encodeURIComponent(dmpId));
    },
  },
};
