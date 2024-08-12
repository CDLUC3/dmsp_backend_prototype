import { Resolvers } from "../types";
import { logger, formatLogMessage } from "../logger";
import { TemplateCollaborator } from "../models/Collaborator";
import  { User } from '../models/User';
import { MyContext } from "../context";

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Query: {
    // Get all of the Users that belong to another affiliation that can edit the Template
    templateCollaborators: async (_, { templateId }, { dataSources }: MyContext): Promise<TemplateCollaborator[] | null> => {
      const logMessage = `Resolving query templateCollaborators: ${templateId}`;
      try {
        const sql = 'SELECT * FROM templateCollaborators WHERE templateId = ? ORDER BY email ASC';
        const resp = await dataSources.sqlDataSource.query(sql, [templateId.toString()]);
        formatLogMessage(logger).debug(logMessage);
        return resp;
      } catch (err) {
        formatLogMessage(logger).error(`Failure in templateCollaborators query: ${templateId} - ${err.message}`);
        return [];
      }
    },
  },

  TemplateCollaborator: {
    template: async (parent: TemplateCollaborator, _, { dataSources }: MyContext) => {
      const logMessage = `Resolving chained query for templateCollaborator template for id ${parent.templateId}`;
      try {
        const sql = 'SELECT * FROM templates WHERE templateId = ?';
        const resp = await dataSources.sqlDataSource.query(sql, [parent.templateId.toString()]);
        formatLogMessage(logger).debug(logMessage);
        return resp;
      } catch (err) {
        formatLogMessage(logger).error(`Error fetching templateCollaborator template: ${parent.templateId} - ${err.message}`);
        return null;
      }
    },

    // Chained resolver to fetch the Affiliation info for the user
    invitedBy: async (parent: TemplateCollaborator) => {
      const logMessage = `Resolving chained query for templateCollaborator invitedBy for id ${parent.invitedById}`
      try {
        const user = await User.findById(parent.invitedById);
        formatLogMessage(logger).debug(logMessage);
        return user;
      } catch (err) {
        formatLogMessage(logger).error(`Error fetching templateCollaborator invitedBy ${parent.invitedById} - ${err.message}`);
        return null;
      }
    },

    user: async (parent: TemplateCollaborator) => {
      const logMessage = `Resolving chained query for templateCollaborator user for id ${parent.userId}`
      try {
        const user = await User.findById(parent.userId);
        formatLogMessage(logger).debug(logMessage);
        return user;
      } catch (err) {
        formatLogMessage(logger).error(`Error fetching templateCollaborator user ${parent.userId} - ${err.message}`);
        return null;
      }
    },
  },
};
