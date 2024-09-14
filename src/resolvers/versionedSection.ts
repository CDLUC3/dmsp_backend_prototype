import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedSection } from "../models/VersionedSection";
import { ForbiddenError } from "../utils/graphQLErrors";
import { hasPermission } from "../services/sectionService";

export const resolvers: Resolvers = {
    Query: {
        // Get all of the versionedSection records for the given sectionId
        sectionVersions: async (_, { sectionId }, context: MyContext): Promise<VersionedSection[]> => {

            // Find section with matching sectionId
            const versionedSections = await VersionedSection.getVersionedSectionsWithTemplateAndSection('versionedSection resolver', context, sectionId);

            // Check if the array has data and access the first versioned section

            if (versionedSections.length > 0) {
                let templateId;
                const template = versionedSections[0].versionedTemplate;
                if (typeof template === 'string') {

                    const parsedTemplate = JSON.parse(template);
                    if ('id' in parsedTemplate) {
                        templateId = parsedTemplate.id;

                        return versionedSections;

                    }

                }


                return versionedSections;
                // Check permission using the versionedTemplateId from the first section
                // if (await hasPermission(context, template.id)) {
                //     return versionedSections;
                // }
            }

            //throw ForbiddenError();
        }
    },
};
