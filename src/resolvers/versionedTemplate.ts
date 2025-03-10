import { Resolvers } from "../types";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";
import { Affiliation } from "../models/Affiliation";
import { VersionedSection } from "../models/VersionedSection";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors";
import { isAdmin } from "../services/authService";
import { formatLogMessage } from "../logger";
import { GraphQLError } from "graphql";

export const resolvers: Resolvers = {
  Query: {
    // Get all of the PublishedTemplates for the specified Template (a.k. the Template history)
    //    - called from the Template history page
    templateVersions: async (_, { templateId }, context: MyContext): Promise<VersionedTemplate[]> => {
      const reference = 'templateVersions resolver';
      try {
        if (isAdmin(context.token)) {
          return await VersionedTemplate.findByTemplateId(reference, context, templateId);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Search for PublishedTemplates whose name or owning Org's name contains the search term
    //    - called by the Template Builder - prior template selection page
    publishedTemplates: async (_, { term }, context: MyContext): Promise<VersionedTemplate[]> => {
      const reference = 'publishedTemplates resolver';
      try {
        if (isAdmin(context.token)) {
          return await VersionedTemplate.search(reference, context, term);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Get the VersionedTemplates that belong to the current user's affiliation (user must be an Admin)
    myVersionedTemplates: async (_, __, context: MyContext): Promise<VersionedTemplate[]> => {
      const reference = 'myVersionedTemplates resolver';
      try {
        if (isAdmin(context.token)) {
          return await VersionedTemplate.findByAffiliationId(reference, context, context.token?.affiliationId);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  VersionedTemplate: {
    // Chained resolver to fetch the Affiliation info for the user
    template: async (parent: VersionedTemplate, _, context: MyContext): Promise<Template> => {
      return await Template.findById('Chained VersionedTemplate.template', context, parent.templateId);
    },

    // Chained resolver to return the Affiliation that owns the Template
    owner: async (parent: VersionedTemplate, _, context: MyContext): Promise<Affiliation> => {
      return await Affiliation.findByURI('Chained VersionedTemplate.owner', context, parent.ownerId);
    },

    // Chained resolver to return the User who created the version
    versionedBy: async (parent: VersionedTemplate, _, context: MyContext): Promise<User> => {
      return await User.findById('Chained VersionedTemplate.versionedBy', context, parent.versionedById);
    },

    // Chained resolver to return the VersionedSections associated with this VersioneTemplate
    versionedSections: async (parent: VersionedTemplate, _, context: MyContext): Promise<VersionedSection[]> => {
      return await VersionedSection.findByTemplateId('Chained VersionedTemplate.versionedSection', context, parent.id);
    },
  },
};
