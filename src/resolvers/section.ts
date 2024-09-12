import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Template } from "../models/Template";
import { SectionTag } from "../models/SectionTag";
import { Tag } from "../types";
import { VersionedSection } from '../models/VersionedSection';
import { cloneSection, hasPermission } from "../services/sectionService";
import { ForbiddenError, NotFoundError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
    Query: {
        sections: async (_, { templateId }, context: MyContext): Promise<Section[]> => {

            if (await hasPermission(context, templateId)) {
                return await Section.getSectionsWithTagsByTemplateId('sections resolver', context, templateId);
            }
        },
        section: async (_, { sectionId }, context: MyContext): Promise<Section> => {

            // Find section with matching sectionId
            const section = await Section.getSectionBySectionId('section resolver', context, sectionId);

            if (await hasPermission(context, section.templateId)) {
                return section;
            }
        }
    },

    Mutation: {
        addSection: async (_, { input: { templateId, name, copyFromSectionId, introduction, requirements, tags, guidance, displayOrder } }, context: MyContext): Promise<Section> => {

            if (await hasPermission(context, templateId)) {
                let section: Section;
                if (copyFromSectionId) {
                    // Fetch the VersionedTemplate we are cloning
                    const original = await VersionedSection.getVersionedSectionById(
                        'addSection resolver',
                        context,
                        copyFromSectionId
                    );

                    if (original) {
                        section = cloneSection(context.token?.id, templateId, copyFromSectionId, original);
                        section.name = name;
                    } else {
                        throw NotFoundError();
                    }

                }
                if (!section) {
                    // Create a new blank section
                    section = new Section({ name, templateId, introduction, requirements, guidance, displayOrder });
                }

                // create the new section
                const newSection = await section.create(context);

                // Add tags to sectionTags table
                if (tags && tags.length > 0) {
                    await Promise.all(
                        tags.map(async (tagId) => {
                            const sectionTag = new SectionTag({
                                sectionId: newSection.id,
                                tagId: tagId.id
                            });

                            await sectionTag.create(context);
                        })
                    );

                    // Add tags to the returned section
                    newSection.tags = tags.map(tagId => ({
                        id: tagId.id,
                        name: tagId.name,
                        description: tagId.description
                    })) as Tag[];
                } else {
                    newSection.tags = [];
                }

                return newSection;
            }

        },
    }
};
