import { PublishedSectionSearchResults, Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedSection } from "../models/VersionedSection";
import { Section } from "../models/Section";
import { Tag } from "../models/Tag";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { ForbiddenError, AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { hasPermissionOnSection } from "../services/sectionService";
import { VersionedQuestion } from "../models/VersionedQuestion";
import { formatLogMessage } from "../logger";
import { GraphQLError } from "graphql";
import { PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from "../types/general";
import { isNullOrUndefined } from "../utils/helpers";

export const resolvers: Resolvers = {
  Query: {
    // Get all of the versionedSection records for the given sectionId
    sectionVersions: async (_, { sectionId }, context: MyContext): Promise<VersionedSection[]> => {
      const reference = 'sectionVersions resolver';
      try {
        // Find versionedSections with matching sectionId
        const versionedSections = await VersionedSection.findBySectionId(reference, context, sectionId);

        // Check if the array has data and access the first versioned section
        const templateId = versionedSections[0].versionedTemplateId;
        if (await hasPermissionOnSection(context, templateId)) {
          return versionedSections;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Get all of the published versionedSections with the given name
    publishedSections: async (_, { term, paginationOptions }, context: MyContext): Promise<PublishedSectionSearchResults> => {
      const reference = 'publishedSections resolver';
      try {
        const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
                    ? paginationOptions as PaginationOptionsForOffsets
                    : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

        return await VersionedSection.findByName(reference, context, term, opts);
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  VersionedSection: {
    // Chained resolver to fetch the Section related to VersionedSection
    section: async (parent: VersionedSection, _, context: MyContext): Promise<Section> => {
      return await Section.findById('VersionedSection resolver', context, parent.sectionId);
    },
    // Chained resolver to fetch the versionedTemplate that the VersionedSection belongs to
    versionedTemplate: async (parent: VersionedSection, _, context: MyContext): Promise<VersionedTemplate> => {
      return await VersionedTemplate.findVersionedTemplateById('VersionSection resolver', context, parent.versionedTemplateId);
    },
    // Chained resolver to fetch the Tags belonging to VersionedSection
    tags: async (parent: VersionedSection, _, context: MyContext): Promise<Tag[]> => {
      return await Tag.findBySectionId('updateSection resolver', context, parent.sectionId);
    },
    // Chained resolver to return the VersionedQuestions associated with this VersionedSection
    versionedQuestions: async (parent: VersionedSection, _, context: MyContext): Promise<VersionedQuestion[]> => {
      return await VersionedQuestion.findByVersionedSectionId(
        'Chained VersionedSection.versionedQuestions',
        context,
        parent.id
      );
    },
  }
};
