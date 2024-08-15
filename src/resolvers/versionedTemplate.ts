import { Resolvers } from "../types";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";
import { Affiliation } from "../models/Affiliation";

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Query: {
    // Get all of the PublishedTemplates for the specified Template (a.k. the Template history)
    templateVersions: async (_, { templateId }, context: MyContext): Promise<VersionedTemplate[] | null> => {
      // TODO: perform a check here to make sure the User within the context is an Admin
      return  VersionedTemplate.findByTemplateId('templateVersions resolver', context, templateId);
    },

    // Get the DMPTool Best Practice PublishedTemplates
    bestPracticeTemplates: async (_, __, context: MyContext): Promise<VersionedTemplate[] | null> => {
      return VersionedTemplate.bestPractice('bestPracticeTemplates resolver', context);
    },

    // Search for PublishedTemplates whose name or owning Org's name contains the search term
    publishedTemplates: async (_, { term }, context: MyContext): Promise<VersionedTemplate[] | null> => {
      return VersionedTemplate.search('publishedTemplates resolver', context, term);
    },

    // Get the specified PublishedTemplate
    publishedTemplate: async (_, { publishedTemplateId }, context: MyContext): Promise<VersionedTemplate | null> => {
      return VersionedTemplate.findPublishedTemplateById('publishedTemplate resolver', context, publishedTemplateId);
    }
  },

  VersionedTemplate: {
    // Chained resolver to fetch the Affiliation info for the user
    template: async (parent: VersionedTemplate, _, context: MyContext): Promise<Template | null> => {
      return Template.findById('Chained VersionedTemplate.template', context, parent.templateId);
    },

    // Chained resolver to return the Affiliation that owns the Template
    owner: async (parent: VersionedTemplate, _, context: MyContext): Promise<Affiliation | null> => {
      return Affiliation.findById('Chained VersionedTemplate.owner', context, parent.ownerId);
    },

    // Chained resolver to return the User who created the version
    versionedBy: async (parent: VersionedTemplate, _, context: MyContext): Promise<User | null> => {
      return User.findById('Chained VersionedTemplate.versionedBy', context, parent.versionedById);
    },
  },
};
