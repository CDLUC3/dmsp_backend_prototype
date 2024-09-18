import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Tag } from "../models/Tag";
import { hasPermission } from "../services/sectionService";
import { NotFoundError, ForbiddenError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
    Query: {
        tags: async (_, __, context: MyContext): Promise<Tag[]> => {
            return await Tag.getAllTags('tags resolver', context);
        },
        tagsBySectionId: async (_, { sectionId }, context: MyContext): Promise<Tag[]> => {
            // Find section with matching sectionId
            const section = await Section.getSectionBySectionId('section resolver', context, sectionId);
            if (!section) {
                throw NotFoundError('Section not found')
            }

            if (await hasPermission(context, section.templateId)) {
                return await Tag.getTagsBySectionId('tagsBySectionId resolver', context, sectionId);
            }

            throw ForbiddenError();
        },
    },
    Mutation: {
        addTag: async (_, { name, description }, context: MyContext): Promise<Tag> => {
            const tag = new Tag({ name, description });
            const newTag = await tag.create(context);
            if (newTag) {
                return newTag;
            } else {
                throw ForbiddenError();
            }
        },
        updateTag: async (_, { tagId, name, description }, context: MyContext): Promise<Tag> => {
            const tagData = await Tag.getTagById('updateTag resolver', context, tagId);
            if (tagData) {
                const tag = new Tag({
                    ...tagData,  // Spread the existing tag data
                    name: name || tagData.name,
                    description: description || tagData.description
                });

                const updatedTag = await tag.update(context);

                if (updatedTag) {
                    return updatedTag;
                } else {
                    throw ForbiddenError();
                }
            }
            throw NotFoundError();
        },
        removeTag: async (_, { tagId }, context: MyContext): Promise<Tag> => {
            const tagData = await Tag.getTagById('removeTag resolver', context, tagId);
            if (tagData) {
                const tag = new Tag({
                    ...tagData,
                    id: tagId
                });
                return await tag.delete(context);
            }
            throw NotFoundError();
        },
    },

};
