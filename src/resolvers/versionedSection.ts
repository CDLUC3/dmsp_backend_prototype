import {
  Resolvers,
  VersionedSectionSearchResults,
  VersionedSection as VersionedSectionGql,
  VersionedCustomSection as VersionedCustomSectionGql,
  Section as SectionGql,
  VersionedTemplate as VersionedTemplateGql,
  Tag as TagGql,
  VersionedCustomQuestion as VersionedCustomQuestionGql,
} from "../types.js";
import { MyContext } from "../context.js";
import { VersionedSection, VersionedSectionSearchResult } from "../models/VersionedSection.js";
import { VersionedCustomSection } from "../models/VersionedCustomSection.js";
import { Section } from "../models/Section.js";
import { Tag } from "../models/Tag.js";
import { VersionedTemplate } from "../models/VersionedTemplate.js";
import {
  AuthenticationError,
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from "../utils/graphQLErrors.js";
import { VersionedQuestion } from "../models/VersionedQuestion.js";
import { prepareObjectForLogs } from "../logger.js";
import { GraphQLError } from "graphql";
import { PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from "../types/general.js";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";
import { isAuthorized } from "../services/authService.js";
import { VersionedCustomQuestion } from "../models/VersionedCustomQuestion.js";

// The model classes below (VersionedSection, Section, VersionedTemplate, Tag, VersionedCustomQuestion, etc.)
// don't structurally match their generated GraphQL-facing counterparts (e.g. some model fields such as
// Tag.slug are optional while the schema declares them non-null, and models expose raw FK ids instead of
// the nested objects the schema exposes). There are no codegen "mappers" configured to reconcile this, so
// we cast the model instances returned here to their generated-type equivalents at the resolver boundary.
export const resolvers: Resolvers = {
  Query: {
    // Get all of the versionedSection records for the given sectionId
    sectionVersions: async (_, { sectionId }, context: MyContext) => {
      const reference = 'sectionVersions resolver';
      try {
        // Find versionedSections with matching sectionId
        return await VersionedSection.findBySectionId(reference, context, sectionId) as unknown as VersionedSectionGql[];
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Get all of the published versionedSections with the given name
    publishedSections: async (_, { term, paginationOptions }, context: MyContext): Promise<VersionedSectionSearchResults> => {
      const reference = 'publishedSections resolver';
      try {
        const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
          ? paginationOptions as PaginationOptionsForOffsets
          : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

        // Find published versionedSections with similar names for the current user
        return await VersionedSectionSearchResult.search(reference, context, term, opts);
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Get a specific VersionedSection
    publishedSection: async (_, { versionedSectionId }, context: MyContext) => {
      const reference = 'publishedSection resolver';
      try {
        if (isAuthorized(context.token)) {
          return await VersionedSection.findById(reference, context, versionedSectionId) as unknown as VersionedSectionGql | null;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Get published, custom section
    publishedCustomSection: async (
      _,
      { customSectionId, planId },
      context: MyContext
    ): Promise<VersionedCustomSection> => {
      const reference = 'publishedCustomSection resolver';
      try {
        if (!isAuthorized(context.token)) {
          throw context?.token ? ForbiddenError() : AuthenticationError();
        }

        const affiliationId = context.token.affiliationId;
        if (!affiliationId) throw ForbiddenError();

        const result = await VersionedCustomSection.findByPlanAndSectionId(
          reference,
          context,
          planId,
          customSectionId,
          affiliationId
        );

        if (!result) {
          throw NotFoundError(`Custom section with ID ${customSectionId} not found`);
        }

        return result;
      } catch (err) {
        if (err instanceof GraphQLError) throw err;
        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },


  VersionedSection: {
    // Chained resolver to fetch the Section related to VersionedSection
    // `parent` is typed to the GraphQL-facing shape (no raw FK fields), but at runtime it is
    // actually the VersionedSection model instance returned by the parent resolver.
    section: async (parent, _, context: MyContext) => {
      const model = parent as unknown as VersionedSection;
      return await Section.findById('VersionedSection resolver', context, model.sectionId) as unknown as SectionGql | null;
    },
    // Chained resolver to fetch the versionedTemplate that the VersionedSection belongs to
    // (this field is non-nullable in the schema, so a missing VersionedTemplate is an error, not a null)
    versionedTemplate: async (parent, _, context: MyContext) => {
      const model = parent as unknown as VersionedSection;
      const versionedTemplate = await VersionedTemplate.findVersionedTemplateById('VersionSection resolver', context, model.versionedTemplateId);
      if (!versionedTemplate) {
        throw NotFoundError(`VersionedTemplate with ID ${model.versionedTemplateId} not found`);
      }
      return versionedTemplate as unknown as VersionedTemplateGql;
    },
    // Chained resolver to fetch the Tags belonging to VersionedSection
    tags: async (parent, _, context: MyContext) => {
      const model = parent as unknown as VersionedSection;
      return await Tag.findBySectionId('updateSection resolver', context, model.sectionId) as unknown as TagGql[];
    },
    // Chained resolver to return the VersionedQuestions associated with this VersionedSection
    versionedQuestions: async (parent, _, context: MyContext) => {
      if (isNullOrUndefined(parent.id)) return [];
      return await VersionedQuestion.findByVersionedSectionId(
        'Chained VersionedSection.versionedQuestions',
        context,
        parent.id
      );
    },
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },
  VersionedCustomSection: {
    questions: async (parent, _, context: MyContext) => {
      if (isNullOrUndefined(parent.id)) return [];
      return await VersionedCustomQuestion.findByVersionedCustomSectionId(
        'Chained VersionedCustomSection.questions',
        context,
        parent.id
      ) as unknown as VersionedCustomQuestionGql[];
    },
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  }
};
