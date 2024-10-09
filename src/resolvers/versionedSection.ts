import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedSection } from "../models/VersionedSection";
import { Section } from "../models/Section";
import { Tag } from "../models/Tag";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { ForbiddenError, NotFoundError } from "../utils/graphQLErrors";
import { hasPermissionOnSection } from "../services/sectionService";

export const resolvers: Resolvers = {
    Query: {
        // Get all of the versionedSection records for the given sectionId
        sectionVersions: async (_, { sectionId }, context: MyContext): Promise<VersionedSection[]> => {

            // Find versionedSections with matching sectionId
            const versionedSections = await VersionedSection.findBySectionId('versionedSection resolver', context, sectionId);

            // Check if the array has data and access the first versioned section
            if (versionedSections.length > 0) {
                const templateId = versionedSections[0].versionedTemplateId;
                if (await hasPermissionOnSection(context, templateId)) {
                    return versionedSections;
                }
                throw ForbiddenError();
            }

            throw NotFoundError();
        },
        // Get all of the published versionedSections with the given name
        publishedSections: async (_, { term }, context: MyContext): Promise<VersionedSection[]> => {

            // Find published versionedSections with similar names
            const temp = await VersionedSection.findByName('publishedSections resolver', context, term);
            return temp;

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
            return await Tag.getTagsBySectionId('updateSection resolver', context, parent.sectionId);
        },

    }
};
