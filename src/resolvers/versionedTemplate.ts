import { Resolvers } from "../types";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";
import { Affiliation } from "../models/Affiliation";
import { VersionedSection } from "../models/VersionedSection";
import { AuthenticationError, ForbiddenError } from "../utils/graphQLErrors";
import { isAdmin } from "../services/authService";

export const resolvers: Resolvers = {
  Query: {
    // Get all of the PublishedTemplates for the specified Template (a.k. the Template history)
    //    - called from the Template history page
    templateVersions: async (_, { templateId }, context: MyContext): Promise<VersionedTemplate[]> => {
      if (isAdmin(context.token)) {
        return await VersionedTemplate.findByTemplateId('templateVersions resolver', context, templateId);
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    // Search for PublishedTemplates whose name or owning Org's name contains the search term
    //    - called by the Template Builder - prior template selection page
    publishedTemplates: async (_, { term }, context: MyContext): Promise<VersionedTemplate[]> => {
      if (isAdmin(context.token)) {
        return await VersionedTemplate.search('publishedTemplates resolver', context, term);
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
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

    // Chained resolver to return the User who created the version
    versionedSection: async (parent: VersionedTemplate, _, context: MyContext): Promise<VersionedSection[]> => {
      return await VersionedSection.getVersionedSectionsByTemplateId('Chained VersionedTemplate.versionedSection', context, parent.id);
    },
  },
};
