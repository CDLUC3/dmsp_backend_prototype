import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Section } from "../models/Section";
import { Tag } from "../models/Tag";
import { hasPermissionOnSection } from "../services/sectionService";
import { isSuperAdmin } from "../services/authService";
import { NotFoundError, ForbiddenError, AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { prepareObjectForLogs } from "../logger";
import { GraphQLError } from "graphql";


export const resolvers: Resolvers = {
  Query: {
    // return all of the tags
    tags: async (_, __, context: MyContext): Promise<Tag[]> => {
      const reference = 'tags resolver';
      try {
        return await Tag.findAll(reference, context);
      } catch (err) {
        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return all of the tags for the specified section
    tagsBySectionId: async (_, { sectionId }, context: MyContext): Promise<Tag[]> => {
      const reference = 'tagsBySectionId resolver';
      try {
        // Find section with matching sectionId
        const section = await Section.findById(reference, context, sectionId);
        if (!section) {
          throw NotFoundError('Section not found')
        }

        if (await hasPermissionOnSection(context, section.templateId)) {
          return await Tag.findBySectionId('tagsBySectionId resolver', context, sectionId);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
  Mutation: {
    addTag: async (_, { name, description }, context: MyContext): Promise<Tag> => {
      const reference = 'addTag resolver';
      try {
        if (isSuperAdmin(context.token)) {
          const tag = new Tag({ name, description });
          const newTag = await tag.create(context);

          if (!newTag || newTag.hasErrors()) {
            tag.addError('general', 'Unable to create tag');
          }
          return tag.hasErrors() ? tag : newTag;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update and existing tag
    updateTag: async (_, { tagId, name, description }, context: MyContext): Promise<Tag> => {
      const reference = 'updateTag resolver';
      try {
        if (isSuperAdmin(context.token)) {
          const tagData = await Tag.findById(reference, context, tagId);
          if (tagData) {
            const tag = new Tag({
              ...tagData,  // Spread the existing tag data
              name: name || tagData.name,
              description: description || tagData.description
            });

            const updated = await tag.update(context);
            if (!updated || updated.hasErrors()) {
              tag.addError('general', 'Unable to update tag');
            }
            return tag.hasErrors() ? tag : updated;
          }

          throw NotFoundError();
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // remove an existing tag
    removeTag: async (_, { tagId }, context: MyContext): Promise<Tag> => {
      const reference = 'removeTag resolver';
      try {
        if (isSuperAdmin(context.token)) {
          const tagData = await Tag.findById(reference, context, tagId);
          if (tagData) {
            const tag = new Tag({ ...tagData, id: tagId });
            const removedTag = await tag.delete(context);
            if (!removedTag || removedTag.hasErrors()) {
              tag.addError('general', 'Unable to delete tag');
            }
            return tag.hasErrors() ? tag : removedTag;
          }
          throw NotFoundError();
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

};
