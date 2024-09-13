import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Tag } from "../models/Tag";
import { NotFoundError } from "../utils/graphQLErrors";


export const resolvers: Resolvers = {
    Query: {
        tags: async (_, __, context: MyContext): Promise<Tag[]> => {
            return await Tag.getAllTags('Tags resolver', context);
        },
    },
    Mutation: {
        addTag: async (_, { name, description }, context: MyContext): Promise<Tag> => {
            const tag = new Tag({ name, description });
            return await tag.create(context);
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

                return updatedTag;

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
