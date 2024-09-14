import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedSection } from "../models/VersionedSection";
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
                const templateId = versionedSections[0].versionedTemplateId;
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
};
