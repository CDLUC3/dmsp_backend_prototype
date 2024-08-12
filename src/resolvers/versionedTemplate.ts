import { Resolvers } from "../types";
import { logger, formatLogMessage } from "../logger";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { User } from '../models/User';
import { DMPToolAPI } from "../datasources/dmptoolAPI";
import { MyContext } from "../context";
import { Template } from "../models/Template";
import { AffiliationModel } from "../models/Affiliation";

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Query: {
    // Get all of the PublishedTemplates for the specified Template (a.k. the Template history)
    templateVersions: async (_, { templateId }, { logger, dataSources }: MyContext): Promise<VersionedTemplate[] | null> => {
      const logMessage = `Resolving query templateVersions: ${templateId}`;
      try {
        const sql = 'SELECT * FROM versionedTemplates WHERE templateId = ? ORDER BY version DESC';
        const resp = await dataSources.sqlDataSource.query(sql, [templateId.toString()]);
        formatLogMessage(logger).debug(logMessage);
        return resp;
      } catch (err) {
        formatLogMessage(logger).error(`Failure in templateVersions query: ${templateId} - ${err.message}`);
        return [];
      }
    },

    // Get the DMPTool Best Practice PublishedTemplates
    bestPracticeTemplates: async (_, __, { logger, dataSources }: MyContext): Promise<VersionedTemplate[] | null> => {
      const logMessage = 'Resolving query bestPracticeTemplates';
      try {
        const sql = 'SELECT * FROM versionedTemplates WHERE bestPractice = 1 AND active = 1 ORDER BY name ASC';
        const resp = await dataSources.sqlDataSource.query(sql, []);
        formatLogMessage(logger).debug(logMessage);
        return resp;
      } catch (err) {
        formatLogMessage(logger).error(`Failure in bestPracticeTemplates query - ${err.message}`);
        return [];
      }
    },

    // Search for PublishedTemplates whose name or owning Org's name contains the search term
    publishedTemplates: async (_, { term }, { logger, dataSources }: MyContext): Promise<VersionedTemplate[] | null> => {
      const logMessage = `Resolving query publishedTemplates: ${term}`;
      try {
        const sql = 'SELECT * FROM versionedTemplates WHERE name LIKE ? ORDER BY name ASC';
        const resp = await dataSources.sqlDataSource.query(sql, [`%${term}%`]);
        formatLogMessage(logger).debug(logMessage);
        return resp;
      } catch (err) {
        formatLogMessage(logger).error(`Failure in publishedTemplates query: ${term} - ${err.message}`);
        return [];
      }
    },

    // Get the specified PublishedTemplate
    publishedTemplate: async (_, { publishedTemplateId }, { logger, dataSources }: MyContext): Promise<VersionedTemplate | null> => {
      const logMessage = `Resolving query publishedTemplate: ${publishedTemplateId}`;
      try {
        const sql = 'SELECT * FROM publishedTemplates WHERE templateId = ?';
        const resp = await dataSources.sqlDataSource.query(sql, [publishedTemplateId.toString()]);
        formatLogMessage(logger).debug(logMessage);
        return resp;
      } catch (err) {
        formatLogMessage(logger).error(`Failure in template query: ${publishedTemplateId} - ${err.message}`);
        return null;
      }
    }
  },

  VersionedTemplate: {
    // Chained resolver to fetch the Affiliation info for the user
    template: async (parent: VersionedTemplate, _, { dataSources }: MyContext) => {
      return Template.findById(`VersionedTemplate id: ${parent.id}`, dataSources.sqlDataSource, parent.templateId);
    },

    affiliation: async (parent: VersionedTemplate, _, { dataSources }: MyContext) => {
      return AffiliationModel.findById(`VersionedTemplate id: ${parent.id}`, dataSources.dmptoolAPIDataSource,
        parent.affiliationId);
    },

    versionedBy: async (parent: VersionedTemplate) => {
      const logMessage = `Resolving chained query for versionedTemplate versionedBy for id ${parent.versionedById}`
      try {
        const user = await User.findById(parent.versionedById);
        formatLogMessage(logger).debug(logMessage);
        return user;
      } catch (err) {
        formatLogMessage(logger).error(`Error fetching versionedTemplate versionedBy ${parent.versionedById} - ${err.message}`);
        return null;
      }
    },

    owner: async (parent: VersionedTemplate) => {
      const logMessage = `Resolving chained query for versionedTemplate owner for id ${parent.ownerId}`
      try {
        const user = await User.findById(parent.ownerId);
        formatLogMessage(logger).debug(logMessage);
        return user;
      } catch (err) {
        formatLogMessage(logger).error(`Error fetching versionedTemplate owner ${parent.ownerId} - ${err.message}`);
        return null;
      }
    },
  },
};
