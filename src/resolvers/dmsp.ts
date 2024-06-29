import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";

export const resolvers: Resolvers = {
  Query: {
    // returns a DMSP that matches the specified DMP ID
    dmspById: (_, { dmspId }, { logger, dataSources }) => {
      const logMessage = `Resolving query dmspById(dmspId: '${dmspId}')`;

      return new Promise((resolve, reject) => {
        dataSources.dmphubAPIDataSource.getDMSP(encodeURIComponent(dmspId))
          .then(rows => {
            formatLogMessage(logger).debug(logMessage);
            resolve(rows)
          })
          .catch(err => {
            formatLogMessage(logger, { err, dmspId }).error(`ERROR: ${logMessage} - ${err.message}`);
            reject(err)
          });
      });
    },
  },
};
