import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { SectionTag } from "../models/SectionTag";
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
            const section = await Section.getSectionWithTagsBySectionId('section resolver', context, sectionId);

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

                const sectionId = newSection.id;

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
                }

                // Return newly created section with tags
                return await Section.getSectionWithTagsBySectionId('addSection resolver', context, sectionId);
            }
        },

        updateSection: async (_, { input: { sectionId, name, introduction, requirements, guidance, tags, displayOrder } }, context: MyContext): Promise<Section> => {

            const sectionData = await Section.getSectionBySectionId('section resolver', context, sectionId);
            if (sectionData) {
                if (await hasPermission(context, sectionData.templateId)) {
                    const section = new Section({
                        ...sectionData,  // Spread the existing section data
                        name: name || sectionData.name,
                        introduction: introduction || sectionData.introduction,
                        requirements: requirements || sectionData.requirements,
                        guidance: guidance || sectionData.guidance,
                        displayOrder: displayOrder || sectionData.displayOrder,
                        isDirty: true  // Mark as dirty for update
                    });

                    const updatedSection = await section.update(context);

                    // Add tags to sectionTags table
                    if (tags && tags.length > 0) {
                        await Promise.all(
                            tags.map(async (tagId) => {
                                const sectionTag = new SectionTag({
                                    sectionId: updatedSection.id,
                                    tagId: tagId.id
                                });

                                await sectionTag.create(context);
                            })
                        );
                    }

                    // Return newly created section with tags
                    return await Section.getSectionWithTagsBySectionId('addSection resolver', context, updatedSection.id);
                }
                throw ForbiddenError();
            }
            throw NotFoundError();
        },
        removeSection: async (_, { sectionId }, context: MyContext): Promise<Section> => {
            const sectionData = await Section.getSectionBySectionId('removeSection resolver', context, sectionId);
            if (sectionData) {
                if (await hasPermission(context, sectionData.templateId)) {
                    const section = new Section({
                        ...sectionData,
                        id: sectionId
                    });
                    return await section.delete(context);
                }
                throw ForbiddenError();
            }
            throw NotFoundError();
        },
    }
};
