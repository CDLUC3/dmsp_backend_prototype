import {
  PublishedTemplateSearchResults,
  PublishedTemplateMetaDataResults,
  Resolvers, CustomizableTemplateSearchResults,
  Affiliation as AffiliationGQL,
  VersionedSection as VersionedSectionGQL,
} from "../types.js";
import {
  CustomizableTemplateSearchResult,
  VersionedTemplate, VersionedTemplateSearchResult
} from "../models/VersionedTemplate.js";
import { User } from '../models/User.js';
import { MyContext } from "../context.js";
import { Template } from "../models/Template.js";
import { Affiliation } from "../models/Affiliation.js";
import { VersionedSection } from "../models/VersionedSection.js";
import { AuthenticationError, ForbiddenError, InternalServerError } from "../utils/graphQLErrors.js";
import { isAdmin, isAuthorized } from "../services/authService.js";
import { prepareObjectForLogs } from "../logger.js";
import { GraphQLError } from "graphql";
import { PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from "../types/general.js";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";

export const resolvers: Resolvers = {
  Query: {
    // Get a VersionedTemplate by its id
    versionedTemplate: async (_, { id }, context: MyContext) => {
      const reference = 'versionedTemplate resolver';
      try {
        if (isAuthorized(context.token)) {
          return await VersionedTemplate.findById(reference, context, id);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Get all of the versions for the specified VersionedTemplate (a.k. the Template history)
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

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Search for PublishedTemplates whose name or owning Org's name contains the search term
    //    - called by the Template Builder - prior template selection page
    publishedTemplates: async (_, { term, paginationOptions }, context: MyContext): Promise<PublishedTemplateSearchResults> => {
      const reference = 'publishedTemplates resolver';

      try {
        if (isAuthorized(context.token)) {
          const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
            ? paginationOptions as PaginationOptionsForOffsets
            : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

          return await VersionedTemplateSearchResult.search(reference, context, term ?? '', opts);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Get metadata for client to provide the unique template affiliations, as well as whether there are any best practice templates
    publishedTemplatesMetaData: async (_, __, context: MyContext): Promise<PublishedTemplateMetaDataResults> => {
      const reference = 'publishedTemplatesMetaData resolver';

      try {
        if (isAuthorized(context.token)) {
          // returns associated availableAffiliations and hasBestPracticeTemplates
          return await VersionedTemplate.getFilterMetadata(reference, context);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Get the VersionedTemplates that belong to the current user's affiliation (user must be an Admin)
    myVersionedTemplates: async (_, __, context: MyContext): Promise<VersionedTemplateSearchResult[]> => {
      const reference = 'myVersionedTemplates resolver';
      try {
        if (isAdmin(context.token)) {
          return await VersionedTemplateSearchResult.findByAffiliationId(
            reference,
            context,
            context.token?.affiliationId
          );
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    /**
     * Fetch all customizable funder templates (publicly visible and published)
     * including information about the user's current customization if applicable.
     *
     * @param _ The Apollo parent object (not applicable here)
     * @param term The search term
     * @param status Filter for the customization status
     * @param migrationStatus Filter for the migration status
     * @param paginationOptions Pagination options
     * @param context
     */
    customizableTemplates: async (
      _,
      { term, status, migrationStatus, paginationOptions },
      context: MyContext
    ): Promise<CustomizableTemplateSearchResults> => {
      const reference = "customizableTemplates";
      try {
        if (isAdmin(context.token)) {
          const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
            ? paginationOptions as PaginationOptionsForOffsets
            : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

          return await CustomizableTemplateSearchResult.search(
            reference,
            context,
            term ?? undefined,
            status ?? undefined,
            migrationStatus ?? undefined,
            opts
          );
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    /**
     * Fetch the default best practice template.
     *
     * @param _ The Apollo parent object (not applicable here)
     * @param context
     */
    defaultTemplate: async (_, __, context: MyContext) => {
      try {
        const template = await VersionedTemplate.defaultTemplate("defaultTemplate resolver", context);
        return template ?? null;
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in defaultTemplate resolver`);
        throw InternalServerError();
      }
    },
  },

  VersionedTemplate: {
    // Chained resolver to fetch the Affiliation info for the user
    // `parent` is typed to the GraphQL-facing shape (no raw FK fields), but at runtime it is
    // actually the VersionedTemplate model instance returned by the parent resolver.
    template: async (parent, _, context: MyContext) => {
      const model = parent as unknown as VersionedTemplate;
      return await Template.findById('Chained VersionedTemplate.template', context, model.templateId);
    },

    // Chained resolver to return the Affiliation that owns the Template
    owner: async (parent, _, context: MyContext) => {
      const model = parent as unknown as VersionedTemplate;
      const affiliation = await Affiliation.findByURI('Chained VersionedTemplate.owner', context, model.ownerId);
      return affiliation as unknown as AffiliationGQL;
    },

    // Chained resolver to return the User who created the version
    versionedBy: async (parent, _, context: MyContext) => {
      const model = parent as unknown as VersionedTemplate;
      return await User.findById('Chained VersionedTemplate.versionedBy', context, model.versionedById);
    },

    // Chained resolver to return the VersionedSections associated with this VersioneTemplate
    versionedSections: async (parent, _, context: MyContext) => {
      if (isNullOrUndefined(parent.id)) return [];
      const sections = await VersionedSection.findByTemplateId(
        'Chained VersionedTemplate.versionedSection', context, parent.id
      );
      return sections as unknown as VersionedSectionGQL[];
    },

    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },
};
