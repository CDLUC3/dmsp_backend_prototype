import { Resolvers } from "../types";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";
import { Affiliation } from "../models/Affiliation";

export const resolvers: Resolvers = {
  Query: {
    // Get all of the PublishedTemplates for the specified Template (a.k. the Template history)
    //    - called from the Template history page
    templateVersions: async (_, { templateId }, context: MyContext): Promise<VersionedTemplate[]> => {
      // TODO: perform a check here to make sure the User within the context is an Admin
      return await VersionedTemplate.findByTemplateId('templateVersions resolver', context, templateId);
    },

    // Search for PublishedTemplates whose name or owning Org's name contains the search term
    //    - called by the Template Builder - prior template selection page
    publishedTemplates: async (_, { term }, context: MyContext): Promise<VersionedTemplate[]> => {
      return await VersionedTemplate.search('publishedTemplates resolver', context, term);
    },
  },

  Mutation: {
    // Publish the template or save as a draft
    //     - called from the Template overview page
    createVersion: async (_, { templateId, comment }, _context: MyContext): Promise<VersionedTemplate> => {
      return null;
    },
  },

  VersionedTemplate: {
    // Chained resolver to fetch the Affiliation info for the user
    template: async (parent: VersionedTemplate, _, context: MyContext): Promise<Template> => {
      return await Template.findById('Chained VersionedTemplate.template', context, parent.templateId);
    },

    // Chained resolver to return the Affiliation that owns the Template
    owner: async (parent: VersionedTemplate, _, context: MyContext): Promise<Affiliation> => {
      return await Affiliation.findById('Chained VersionedTemplate.owner', context, parent.ownerId);
    },

    // Chained resolver to return the User who created the version
    versionedBy: async (parent: VersionedTemplate, _, context: MyContext): Promise<User> => {
      return await User.findById('Chained VersionedTemplate.versionedBy', context, parent.versionedById);
    },
  },
};
