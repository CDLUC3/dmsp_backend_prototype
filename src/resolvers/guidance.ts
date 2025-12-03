import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Guidance } from "../models/Guidance";
import { GuidanceGroup } from "../models/GuidanceGroup";
import { User } from "../models/User";
import { hasPermissionOnGuidanceGroup, markGuidanceGroupAsDirty } from "../services/guidanceService";
import { ForbiddenError, NotFoundError, AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { isAdmin } from "../services/authService";
import { prepareObjectForLogs } from "../logger";
import { GraphQLError } from "graphql";
import { normaliseDateTime } from "../utils/helpers";
import { hasPublishedFlag } from "./guidanceGroup";

export const resolvers: Resolvers = {
  Query: {
    // Return all Guidance items for a specific GuidanceGroup
    guidanceByGroup: async (_, { guidanceGroupId }, context: MyContext): Promise<Guidance[]> => {
      const reference = 'guidanceByGroup resolver';
      try {
        const requester = context?.token;
        if (!requester) {
          throw AuthenticationError();
        }

        // Admins with permission: full access
        if (isAdmin(requester) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          return await Guidance.findByGuidanceGroupId(reference, context, guidanceGroupId);
        }

        // For other users: check if guidanceGroup is published
        const guidanceGroup = await GuidanceGroup.findById(reference, context, guidanceGroupId);
        const isPublished = Boolean(guidanceGroup?.latestPublishedDate || hasPublishedFlag(guidanceGroup));
        if (isPublished) {
          return await Guidance.findByGuidanceGroupId(reference, context, guidanceGroupId);
        }

        throw ForbiddenError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;
        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Return a specific Guidance item
    guidance: async (_, { guidanceId }, context: MyContext): Promise<Guidance> => {
      const reference = 'guidance resolver';
      const guidance = await Guidance.findById(reference, context, guidanceId);
      const guidanceGroupId = guidance?.guidanceGroupId;
      try {
        const requester = context?.token;
        if (!requester) {
          throw AuthenticationError();
        }

        // Admins with permission: full access
        if (isAdmin(requester) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          if (!guidance) {
            throw NotFoundError('Guidance not found');
          }
          return guidance;
        }

        // For other users: check if guidanceGroup is published
        const guidanceGroup = await GuidanceGroup.findById(reference, context, guidanceGroupId);
        const isPublished = Boolean(guidanceGroup?.latestPublishedDate || hasPublishedFlag(guidanceGroup));
        if (isPublished) {
          if (!guidance) {
            throw NotFoundError('Guidance not found');
          }
          return guidance;
        }

        throw ForbiddenError();
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
      { input: { guidanceGroupId, guidanceText, tagId } },
      context: MyContext
    ): Promise<Guidance> => {
      const reference = 'addGuidance resolver';
      try {
        if (isAdmin(context?.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          const guidance = new Guidance({
            guidanceGroupId,
            guidanceText,
            tagId,
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
      { input: { guidanceId, guidanceText, tagId } },
      context: MyContext
    ): Promise<Guidance> => {
      const reference = 'updateGuidance resolver';
      const guidance = await Guidance.findById(reference, context, guidanceId);
      const guidanceGroupId = guidance?.guidanceGroupId;
      try {
        if (isAdmin(context?.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          if (!guidance) {
            throw NotFoundError('Guidance not found');
          }

          // Update the fields
          if (guidanceText !== undefined) guidance.guidanceText = guidanceText;
          guidance.tagId = tagId; // the schema requires tagId to be provided so it will never be undefined
          guidance.modifiedById = context.token.id;

          // Save the updates
          const updated = await guidance.update(context);

          if (!updated?.id) {
            if (!guidance.errors['general']) {
              guidance.addError('general', 'Unable to update the guidance');
            }
            return guidance;
          }

          // Mark the guidance group as dirty
          await markGuidanceGroupAsDirty(context, guidance.guidanceGroupId);

          return await Guidance.findById(reference, context, guidanceId);
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
      const guidance = await Guidance.findById(reference, context, guidanceId);
      const guidanceGroupId = guidance?.guidanceGroupId;
      try {
        if (isAdmin(context?.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          if (!guidance) {
            throw NotFoundError('Guidance not found');
          }

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
    created: (parent: Guidance) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: Guidance) => {
      return normaliseDateTime(parent.modified);
    },
    // Resolver to get the user who last modified this guidance
    user: async (parent: Guidance, _, context: MyContext): Promise<User | null> => {
      if (parent?.modifiedById) {
        return await User.findById('Guidance user resolver', context, parent.modifiedById);
      }
      return null;
    },
  },
};
