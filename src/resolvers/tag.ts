import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Tag } from "../models/Tag";
import { hasPermissionOnSection } from "../services/sectionService";
import { isSuperAdmin } from "../services/authService";
import { NotFoundError, ForbiddenError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
    Query: {
        tags: async (_, __, context: MyContext): Promise<Tag[]> => {
            return await Tag.getAllTags('tags resolver', context);
        },
        tagsBySectionId: async (_, { sectionId }, context: MyContext): Promise<Tag[]> => {
            // Find section with matching sectionId
            const section = await Section.findById('section resolver', context, sectionId);
            if (!section) {
                throw NotFoundError('Section not found')
            }

            if (await hasPermissionOnSection(context, section.templateId)) {
                return await Tag.getTagsBySectionId('tagsBySectionId resolver', context, sectionId);
            }

            throw ForbiddenError();
        },
    },
    Mutation: {
        addTag: async (_, { name, description }, context: MyContext): Promise<Tag> => {
            if (isSuperAdmin(context.token)) {
                const tag = new Tag({ name, description });
                return await tag.create(context);
            }
            throw ForbiddenError();
        },
        updateTag: async (_, { tagId, name, description }, context: MyContext): Promise<Tag> => {
            if (isSuperAdmin(context.token)) {
                const tagData = await Tag.getTagById('updateTag resolver', context, tagId);
                if (tagData) {
                    const tag = new Tag({
                        ...tagData,  // Spread the existing tag data
                        name: name || tagData.name,
                        description: description || tagData.description
                    });

                    return await tag.update(context);
                }
                throw NotFoundError();
            }
            throw ForbiddenError();
        },
        removeTag: async (_, { tagId }, context: MyContext): Promise<Tag> => {
            if (isSuperAdmin(context.token)) {
                const tagData = await Tag.getTagById('removeTag resolver', context, tagId);
                if (tagData) {
                    const tag = new Tag({
                        ...tagData,
                        id: tagId
                    });
                    return await tag.delete(context);
                }
                throw NotFoundError();
            }
            throw ForbiddenError();
        },
    },

};
