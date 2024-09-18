import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedSection } from "../models/VersionedSection";
import { Section } from "../models/Section";
import { Tag } from "../models/Tag";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { ForbiddenError, NotFoundError } from "../utils/graphQLErrors";
import { hasPermission } from "../services/sectionService";

export const resolvers: Resolvers = {
    Query: {
        // Get all of the versionedSection records for the given sectionId
        sectionVersions: async (_, { sectionId }, context: MyContext): Promise<VersionedSection[]> => {

            // Find versionedSections with matching sectionId
            const versionedSections = await VersionedSection.getVersionedSectionsBySectionId('versionedSection resolver', context, sectionId);

            // Check if the array has data and access the first versioned section
            if (versionedSections.length > 0) {
                let versionedTemplate = versionedSections[0].versionedTemplate;
                if (typeof versionedTemplate === 'string') {
                    //versionedTemplate is a stringified JSON object, so I need to parse it
                    versionedTemplate = JSON.parse(versionedTemplate);
                }

                const templateId = versionedTemplate.id;
                if (await hasPermission(context, templateId)) {
                    return versionedSections;
                }
                throw ForbiddenError();
            }

            throw NotFoundError();
        },
        // Get all of the published versionedSections with the given name
        publishedSections: async (_, { term }, context: MyContext): Promise<VersionedSection[]> => {

            // Find published versionedSections with similar names
            return await VersionedSection.getVersionedSectionsByName('publishedSections resolver', context, term);

        }
    },

    VersionedSection: {
        // Chained resolver to fetch the Section related to VersionedSection
        section: async (parent: VersionedSection, _, context: MyContext): Promise<Section> => {
            return await Section.getSectionBySectionId('VersionedSection resolver', context, parent.section.id);
        },
        // Chained resolver to fetch the versionedTemplate that the VersionedSection belongs to
        versionedTemplate: async (parent: VersionedSection, _, context: MyContext): Promise<VersionedTemplate> => {
            return await VersionedTemplate.findVersionedTemplateById('VersionSection resolver', context, parent.versionedTemplateId);
        },
        // Chained resolver to fetch the Tags belonging to VersionedSection
        tags: async (parent: VersionedSection, _, context: MyContext): Promise<Tag[]> => {
            return await Tag.getTagsBySectionId('updateSection resolver', context, parent.section.id);
        },

    }
};
