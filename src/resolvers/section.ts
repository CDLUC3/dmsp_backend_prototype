import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { SectionTag } from "../models/SectionTag";
import { Tag } from '../models/Tag';
import { VersionedSection } from '../models/VersionedSection';
import { cloneSection, hasPermission } from "../services/sectionService";
import { ForbiddenError, NotFoundError, BadUserInput } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
    Query: {
        sections: async (_, { templateId }, context: MyContext): Promise<Section[]> => {

            if (await hasPermission(context, templateId)) {
                return await Section.getSectionsWithTagsByTemplateId('sections resolver', context, templateId);
            }
            throw ForbiddenError();
        },
        section: async (_, { sectionId }, context: MyContext): Promise<Section> => {

            // Find section with matching sectionId
            const section = await Section.getSectionWithTagsBySectionId('section resolver', context, sectionId);

            if (await hasPermission(context, section.templateId)) {
                return section;
            }
            throw ForbiddenError();
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


                // If there are errors than throw a Bad User Input error
                if (newSection.errors) {
                    const errorMessages = newSection.errors.join(', ');
                    throw BadUserInput(errorMessages);
                } else {
                    const sectionId = newSection.id;

                    //Get all the existing tags associated with this section
                    const existingTags = await Tag.getTagsBySectionId('updateSection resolver', context, sectionId);

                    // Create a Set of existing tag names
                    const existingTagIds = new Set(existingTags.map(tag => tag.name));

                    // Filter out the tags that already exist in the table.
                    const tagsToAdd = tags.filter(tag => !existingTagIds.has(tag.name));

                    // Add tags to sectionTags table that did not already exist
                    if (tags && tags.length > 0 && tagsToAdd.length > 0) {
                        await Promise.all(
                            tagsToAdd.map(async (tagId) => {
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
            }
        },

        updateSection: async (_, { input: { sectionId, name, introduction, requirements, guidance, tags, displayOrder } }, context: MyContext): Promise<Section> => {

            // Get Section based on provided sectionId
            const sectionData = await Section.getSectionBySectionId('section resolver', context, sectionId);

            // Throw Not Found error if Section is not found
            if (!sectionData) {
                throw NotFoundError('Section not found')
            }

            // Check that user has permission to update this section
            if (await hasPermission(context, sectionData.templateId)) {
                const section = new Section({
                    id: sectionData.id,
                    templateId: sectionData.templateId,
                    createdById: sectionData.createdById,
                    name: name,
                    introduction: introduction,
                    requirements: requirements,
                    guidance: guidance,
                    displayOrder: displayOrder,
                    isDirty: true  // Mark as dirty for update
                });

                const updatedSection = await section.update(context);

                // If there are errors than throw a Bad User Input error
                if (updatedSection.errors) {
                    const errorMessages = updatedSection.errors.join(', ');
                    throw BadUserInput(errorMessages);
                } else {
                    //Get all the existing tags associated with this section
                    const existingTags = await Tag.getTagsBySectionId('updateSection resolver', context, sectionId);

                    // Create a Set of existing tag names
                    const existingTagIds = new Set(existingTags.map(tag => tag.name));

                    // Filter out the tags that already exist in the table.
                    const tagsToAdd = tags.filter(tag => !existingTagIds.has(tag.name));

                    // Add tags to sectionTags table that did not already exist
                    if (tags && tags.length > 0 && tagsToAdd.length > 0) {
                        await Promise.all(
                            tagsToAdd.map(async (tagId) => {
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
            }
            throw ForbiddenError();
        },
        removeSection: async (_, { sectionId }, context: MyContext): Promise<Section> => {
            // Retrieve existing Section
            const sectionData = await Section.getSectionBySectionId('removeSection resolver', context, sectionId);

            // Throw Not Found error if Section is not found
            if (!sectionData) {
                throw NotFoundError('Section not found')
            }

            if (await hasPermission(context, sectionData.templateId)) {
                //Need to create a new instance of Section so that it recognizes the 'delete' function of that instance
                const section = new Section({
                    ...sectionData,
                    id: sectionId
                });

                const deletedSection = await section.delete(context);

                //Delete all sectionTags associated with this section
                await SectionTag.deleteSectionTagsBySectionId('removeSection resolver', context, sectionId);

                return deletedSection;

            }
            throw ForbiddenError();

        },
    }
};
