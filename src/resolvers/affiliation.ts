
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { MyContext } from '../context';
import { AffiliationModel } from '../models/Affiliation';



export const resolvers: Resolvers = {
  Query: {
    // returns an array of Affiliations
    affiliations: async (_, options, { logger, dataSources }: MyContext) => {
      const logMessage = `Resolving query affiliations(options: '${options}')`;

      return new Promise((resolve, reject) => {
        dataSources.dmptoolAPIDataSource.getAffiliations(options)
          .then(rows => {
            formatLogMessage(logger).debug(logMessage);
            resolve(rows)
          })
          .catch(err => {
            formatLogMessage(logger, { err, options }).error(`ERROR: ${logMessage} - ${err.message}`);
            reject(err)
          });
      });
    },

    // Returns the specified Affiliation
    affiliation: async (_, { affiliationId }, { logger, dataSources }: MyContext) => {
      return AffiliationModel.findById('Query affiliation', dataSources.dmptoolAPIDataSource, affiliationId);
    },
  }
}
