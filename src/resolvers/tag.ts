import { Resolvers, Tag as TagGql } from "../types.js";
import { MyContext } from "../context.js";
import { Section } from "../models/Section.js";
import { Tag } from "../models/Tag.js";
import { hasPermissionOnSection } from "../services/sectionService.js";
import { isSuperAdmin } from "../services/authService.js";
import { NotFoundError, ForbiddenError, AuthenticationError, InternalServerError } from "../utils/graphQLErrors.js";
import { prepareObjectForLogs } from "../logger.js";
import { GraphQLError } from "graphql";
import { normaliseDateTime } from "../utils/helpers.js";

export const resolvers: Resolvers = {
  Query: {
    // Cast needed on all Tag-returning resolvers below: the Tag model's `slug` field
    // is optional but required in the generated Tag type, and there are no codegen
    // mappers configured to reconcile this.
    // return all of the tags
    tags: async (_, __, context: MyContext) => {
      const reference = 'tags resolver';
      try {
        const tags = await Tag.findAll(reference, context);
        return tags as unknown as TagGql[];
      } catch (err) {
        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return all of the tags for the specified section
    tagsBySectionId: async (_, { sectionId }, context: MyContext) => {
      const reference = 'tagsBySectionId resolver';
      try {
        // Find section with matching sectionId
        const section = await Section.findById(reference, context, sectionId);
        if (!section) {
          throw NotFoundError('Section not found')
        }

        if (await hasPermissionOnSection(context, section.templateId)) {
          const tags = await Tag.findBySectionId('tagsBySectionId resolver', context, sectionId);
          return tags as unknown as TagGql[];
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
    addTag: async (_, { name, description }, context: MyContext) => {
      const reference = 'addTag resolver';
      try {
        if (isSuperAdmin(context.token)) {
          const tag = new Tag({ name, description: description ?? undefined });
          const newTag = await tag.create(context);

          if (!newTag || newTag.hasErrors()) {
            tag.addError('general', 'Unable to create tag');
          }
          if (tag.hasErrors()) {
            return tag as unknown as TagGql;
          }
          if (!newTag) {
            throw NotFoundError('Unable to create tag');
          }
          return newTag as unknown as TagGql;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update and existing tag
    updateTag: async (_, { tagId, name, description }, context: MyContext) => {
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
            if (tag.hasErrors()) {
              return tag as unknown as TagGql;
            }
            if (!updated) {
              throw NotFoundError('Unable to update tag');
            }
            return updated as unknown as TagGql;
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
    removeTag: async (_, { tagId }, context: MyContext) => {
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
            if (tag.hasErrors()) {
              return tag as unknown as TagGql;
            }
            if (!removedTag) {
              throw NotFoundError('Unable to delete tag');
            }
            return removedTag as unknown as TagGql;
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
  Tag: {
    // `parent` is contextually typed as the generated Tag (not the model class) here,
    // which is all `created`/`modified` need.
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },
};
