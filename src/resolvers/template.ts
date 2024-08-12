import { Resolvers } from "../types";
import { logger, formatLogMessage } from "../logger";
import { Template } from "../models/Template";
import { User } from '../models/User';
import { DMPToolAPI } from "../datasources/dmptoolAPI";
import { MyContext } from "../context";
import { AffiliationModel } from "../models/Affiliation";

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Query: {
    // Get the Templates that belong to the current user's affiliation (user must be an Admin)
    myTemplates: async (_, __, { logger, dataSources }: MyContext): Promise<Template[] | null> => {
      const logMessage = 'Resolving query myTemplates';
      try {
        // TODO: Swap this hard-coded version out once we have the User in the token
        const sql = 'SELECT * FROM templates WHERE userId IN (SELECT id FROM users WHERE email = \'funder.admin@example.com\') ORDER BY modified DESC';
        const resp = await dataSources.sqlDataSource.query(sql, []);
        // const sql = 'SELECT * FROM templates WHERE userId = ? ORDER BY modified DESC';
        // const resp = await dataSources.sqlDataSource.query(sql, [token.userId]);
        formatLogMessage(logger).debug(logMessage);
        return resp;
      } catch (err) {
        formatLogMessage(logger).error(`Failure in myTemplates query - ${err.message}`);
        return [];
      }
    },

    // Get the specified Template (user must be an Admin)
    template: async (_, { templateId }, { logger, dataSources }: MyContext): Promise<Template | null> => {
      return Template.findById(`Query template id: ${templateId}`, dataSources.sqlDataSource, templateId);
    },
  },

  Template: {
    // Chained resolver to fetch the Affiliation info for the user
    affiliation: async (parent: Template, _, { dataSources }: MyContext) => {
      return AffiliationModel.findById(`Template id: ${parent.id}`, dataSources.dmptoolAPIDataSource,
        parent.affiliationId);
    },

    owner: async (parent: Template) => {
      const logMessage = `Resolving chained query for template owner for id ${parent.ownerId}`
      try {
        const user = await User.findById(parent.ownerId);
        formatLogMessage(logger).debug(logMessage);
        return user;
      } catch (err) {
        formatLogMessage(logger).error(`Error fetching template owner ${parent.ownerId} - ${err.message}`);
        return null;
      }
    },
  },
};
