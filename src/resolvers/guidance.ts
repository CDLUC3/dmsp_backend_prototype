import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Guidance } from "../models/Guidance";
import { GuidanceGroup } from "../models/GuidanceGroup";
import { Tag } from "../models/Tag";
import { hasPermissionOnGuidanceGroup, markGuidanceGroupAsDirty } from "../services/guidanceService";
import { ForbiddenError, NotFoundError, AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { isAdmin, isAuthorized } from "../services/authService";
import { prepareObjectForLogs } from "../logger";
import { GraphQLError } from "graphql";
import { normaliseDateTime } from "../utils/helpers";

export const resolvers: Resolvers = {
  Query: {
    // Return all Guidance items for a specific GuidanceGroup
    guidanceByGroup: async (_, { guidanceGroupId }, context: MyContext): Promise<Guidance[]> => {
      const reference = 'guidanceByGroup resolver';
      try {
        if (isAdmin(context?.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          return await Guidance.findByGuidanceGroupId(reference, context, guidanceGroupId);
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Return a specific Guidance item
    guidance: async (_, { guidanceId }, context: MyContext): Promise<Guidance> => {
      const reference = 'guidance resolver';
      try {
        if (isAdmin(context.token)) {
          const guidance = await Guidance.findById(reference, context, guidanceId);
          
          if (!guidance) {
            throw NotFoundError('Guidance not found');
          }

          // Check if user has permission on the parent GuidanceGroup
          if (await hasPermissionOnGuidanceGroup(context, guidance.guidanceGroupId)) {
            return guidance;
          }

          throw ForbiddenError();
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  Mutation: {
    // Add a new Guidance item
    addGuidance: async (
      _,
      { input: { guidanceGroupId, guidanceText, tags } },
      context: MyContext
    ): Promise<Guidance> => {
      const reference = 'addGuidance resolver';
      try {
        if (isAdmin(context?.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          const guidance = new Guidance({ 
            guidanceGroupId,
            guidanceText,
            createdById: context.token.id,
            modifiedById: context.token.id,
          });

          // Create the new guidance
          const newGuidance = await guidance.create(context);
          
          // If the guidance was not created, return the errors
          if (!newGuidance?.id) {
            if (!guidance.errors['general']) {
              guidance.addError('general', 'Unable to create the guidance');
            }
            return guidance;
          }

          // Add tags if provided
          if (tags && tags.length > 0) {
            for (const tagInput of tags) {
              let tag: Tag;
              if (tagInput.id) {
                tag = await Tag.findById(reference, context, tagInput.id);
              } else if (tagInput.name) {
                const existingTags = await Tag.findByName(reference, context, tagInput.name);
                tag = existingTags && existingTags.length > 0 ? existingTags[0] : null;
                
                if (!tag) {
                  // Create new tag
                  tag = new Tag({
                    name: tagInput.name,
                    description: tagInput.description,
                    createdById: context.token.id,
                    modifiedById: context.token.id,
                  });
                  tag = await tag.create(context);
                }
              }

              if (tag?.id) {
                await tag.addToGuidance(context, newGuidance.id);
              }
            }
          }

          // Mark the guidance group as dirty
          await markGuidanceGroupAsDirty(context, guidanceGroupId);

          return await Guidance.findById(reference, context, newGuidance.id);
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Update an existing Guidance item
    updateGuidance: async (
      _,
      { input: { guidanceId, guidanceText, tags } },
      context: MyContext
    ): Promise<Guidance> => {
      const reference = 'updateGuidance resolver';
      try {
        if (isAdmin(context?.token)) {
          const guidance = await Guidance.findById(reference, context, guidanceId);

          if (!guidance) {
            throw NotFoundError('Guidance not found');
          }

          if (await hasPermissionOnGuidanceGroup(context, guidance.guidanceGroupId)) {
            // Update the fields
            if (guidanceText !== undefined) guidance.guidanceText = guidanceText;
            
            guidance.modifiedById = context.token.id;

            // Save the updates
            const updated = await guidance.update(context);

            if (!updated?.id) {
              if (!guidance.errors['general']) {
                guidance.addError('general', 'Unable to update the guidance');
              }
              return guidance;
            }

            // Update tags if provided
            if (tags !== undefined) {
              // Remove existing tags
              const existingTags = await Tag.findByGuidanceId(reference, context, guidanceId);
              for (const existingTag of existingTags) {
                await existingTag.removeFromGuidance(context, guidanceId);
              }

              // Add new tags
              for (const tagInput of tags) {
                let tag: Tag;
                if (tagInput.id) {
                  tag = await Tag.findById(reference, context, tagInput.id);
                } else if (tagInput.name) {
                  const existingTags = await Tag.findByName(reference, context, tagInput.name);
                  tag = existingTags && existingTags.length > 0 ? existingTags[0] : null;
                  
                  if (!tag) {
                    // Create new tag
                    tag = new Tag({
                      name: tagInput.name,
                      description: tagInput.description,
                      createdById: context.token.id,
                      modifiedById: context.token.id,
                    });
                    tag = await tag.create(context);
                  }
                }

                if (tag?.id) {
                  await tag.addToGuidance(context, guidanceId);
                }
              }
            }

            // Mark the guidance group as dirty
            await markGuidanceGroupAsDirty(context, guidance.guidanceGroupId);

            return await Guidance.findById(reference, context, guidanceId);
          }

          throw ForbiddenError();
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Delete a Guidance item
    removeGuidance: async (
      _,
      { guidanceId },
      context: MyContext
    ): Promise<Guidance> => {
      const reference = 'removeGuidance resolver';
      try {
        if (isAdmin(context?.token)) {
          const guidance = await Guidance.findById(reference, context, guidanceId);

          if (!guidance) {
            throw NotFoundError('Guidance not found');
          }

          if (await hasPermissionOnGuidanceGroup(context, guidance.guidanceGroupId)) {
            const guidanceGroupId = guidance.guidanceGroupId;
            const deleted = await guidance.delete(context);

            if (!deleted) {
              guidance.addError('general', 'Unable to delete the guidance');
              return guidance;
            }

            // Mark the guidance group as dirty
            await markGuidanceGroupAsDirty(context, guidanceGroupId);

            return deleted;
          }

          throw ForbiddenError();
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Guidance: {
    // Chained resolver to fetch the GuidanceGroup for this Guidance
    guidanceGroup: async (parent: Guidance, _, context: MyContext): Promise<GuidanceGroup> => {
      return await GuidanceGroup.findById('Chained Guidance.guidanceGroup', context, parent.guidanceGroupId);
    },
    // Chained resolver to fetch the Tags for this Guidance
    tags: async (parent: Guidance, _, context: MyContext): Promise<Tag[]> => {
      return await Tag.findByGuidanceId('Chained Guidance.tags', context, parent.id);
    },
    created: (parent: Guidance) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: Guidance) => {
      return normaliseDateTime(parent.modified);
    },
  }
};
