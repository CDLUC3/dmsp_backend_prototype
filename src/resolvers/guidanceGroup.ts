import { Resolvers } from "../types";
import { MyContext } from "../context";
import { GuidanceGroup } from "../models/GuidanceGroup";
import { Guidance } from "../models/Guidance";
import { hasPermissionOnGuidanceGroup, publishGuidanceGroup, unpublishGuidanceGroup } from "../services/guidanceService";
import { ForbiddenError, NotFoundError, AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { isAdmin, isSuperAdmin } from "../services/authService";
import { prepareObjectForLogs } from "../logger";
import { GraphQLError } from "graphql";
import { normaliseDateTime } from "../utils/helpers";

export const resolvers: Resolvers = {
  Query: {
    // Return all GuidanceGroups for the user's organization
    guidanceGroups: async (_, { affiliationId }, context: MyContext): Promise<GuidanceGroup[]> => {
      const reference = 'guidanceGroups resolver';
      try {
        if (!isAdmin(context?.token)) {
          throw context?.token ? ForbiddenError() : AuthenticationError();
        }

        // If an affiliationId is provided, allow only super-admins or the admin of that affiliation
        if (affiliationId) {
          if (isSuperAdmin(context.token) || context.token.affiliationId === affiliationId) {
            return await GuidanceGroup.findByAffiliationId(reference, context, affiliationId);
          }
          throw ForbiddenError();
        }

        // No affiliationId provided: return groups for the caller's affiliation
        return await GuidanceGroup.findByAffiliationId(reference, context, context.token.affiliationId);
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Return a specific GuidanceGroup
    guidanceGroup: async (_, { guidanceGroupId }, context: MyContext): Promise<GuidanceGroup> => {
      const reference = 'guidanceGroup resolver';
      try {
        if (isAdmin(context.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          return await GuidanceGroup.findById(reference, context, guidanceGroupId);
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
    // Add a new GuidanceGroup
    addGuidanceGroup: async (
      _,
      { input: { affiliationId: tempAffiliationId, name, bestPractice } },
      context: MyContext
    ): Promise<GuidanceGroup> => {
      const reference = 'addGuidanceGroup resolver';
      try {
        const requester = context.token;

        // Choose affiliationId:
        // - if requester is super-admin and provided affiliationId in input, use it
        // - otherwise use the requester's affiliationId (regular admins)
        const affiliationId = isSuperAdmin(requester) && tempAffiliationId
          ? tempAffiliationId
          : requester.affiliationId;

        if (!affiliationId) {
          throw new Error("affiliationId is required (either provide it as a super-admin or ensure the requesting user has an affiliation).");
        }

        const guidanceGroup = new GuidanceGroup({
          affiliationId,
          name,
          bestPractice: bestPractice ?? false,
          createdById: requester.id,
          modifiedById: requester.id,
        });

        // Create the new guidance group
        const newGuidanceGroup = await guidanceGroup.create(context);

        // If the guidance group was not created, return the errors
        if (!newGuidanceGroup?.id) {
          if (!guidanceGroup.errors['general']) {
            guidanceGroup.addError('general', 'Unable to create the guidance group');
          }
          return guidanceGroup;
        }

        return newGuidanceGroup;
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Update an existing GuidanceGroup
    updateGuidanceGroup: async (
      _,
      { input: { guidanceGroupId, name, bestPractice } },
      context: MyContext
    ): Promise<GuidanceGroup> => {
      const reference = 'updateGuidanceGroup resolver';
      try {
        if (isAdmin(context?.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) {
          const guidanceGroup = await GuidanceGroup.findById(reference, context, guidanceGroupId);

          if (!guidanceGroup) {
            throw NotFoundError('GuidanceGroup not found');
          }

          // Update the fields
          if (name !== undefined) guidanceGroup.name = name;
          if (bestPractice !== undefined) guidanceGroup.bestPractice = bestPractice;

          guidanceGroup.modifiedById = context.token.id;

          // Save the updates
          const updated = await guidanceGroup.update(context);

          if (!updated?.id) {
            if (!guidanceGroup.errors['general']) {
              guidanceGroup.addError('general', 'Unable to update the guidance group');
            }
            return guidanceGroup;
          }

          return updated;
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Delete a GuidanceGroup
    removeGuidanceGroup: async (
      _,
      { guidanceGroupId },
      context: MyContext
    ): Promise<GuidanceGroup> => {
      const reference = 'removeGuidanceGroup resolver';
      try {
        if (((isAdmin(context?.token)) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) || isSuperAdmin(context?.token)) {
          const guidanceGroup = await GuidanceGroup.findById(reference, context, guidanceGroupId);

          if (!guidanceGroup) {
            throw NotFoundError('GuidanceGroup not found');
          }

          const deleted = await guidanceGroup.delete(context);

          if (!deleted) {
            guidanceGroup.addError('general', 'Unable to delete the guidance group');
            return guidanceGroup;
          }

          return deleted;
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Publish a GuidanceGroup
    publishGuidanceGroup: async (
      _,
      { guidanceGroupId },
      context: MyContext
    ): Promise<GuidanceGroup> => {
      const reference = 'publishGuidanceGroup resolver';
      try {
        if ((isAdmin(context?.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) || isSuperAdmin(context?.token)) {
          const guidanceGroup = await GuidanceGroup.findById(reference, context, guidanceGroupId);

          if (!guidanceGroup) {
            throw NotFoundError('GuidanceGroup not found');
          }

          const published = await publishGuidanceGroup(context, guidanceGroup);

          if (!published) {
            guidanceGroup.addError('general', 'Unable to publish the guidance group');
            return guidanceGroup;
          }

          // Return the updated guidance group
          return await GuidanceGroup.findById(reference, context, guidanceGroupId);
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Unpublish a GuidanceGroup
    unpublishGuidanceGroup: async (
      _,
      { guidanceGroupId },
      context: MyContext
    ): Promise<GuidanceGroup> => {
      const reference = 'unpublishGuidanceGroup resolver';
      try {
        if ((isAdmin(context?.token) && await hasPermissionOnGuidanceGroup(context, guidanceGroupId)) || isSuperAdmin(context?.token)) {
          const guidanceGroup = await GuidanceGroup.findById(reference, context, guidanceGroupId);

          if (!guidanceGroup) {
            throw NotFoundError('GuidanceGroup not found');
          }

          const unpublished = await unpublishGuidanceGroup(context, guidanceGroup);

          if (!unpublished) {
            guidanceGroup.addError('general', 'Unable to unpublish the guidance group');
            return guidanceGroup;
          }

          return guidanceGroup;
        }

        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  GuidanceGroup: {
    // Chained resolver to fetch the Guidance items for this GuidanceGroup
    guidance: async (parent: GuidanceGroup, _, context: MyContext): Promise<Guidance[]> => {
      return await Guidance.findByGuidanceGroupId('Chained GuidanceGroup.guidance', context, parent.id);
    },
    created: (parent: GuidanceGroup) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: GuidanceGroup) => {
      return normaliseDateTime(parent.modified);
    },
    latestPublishedDate: (parent: GuidanceGroup) => {
      return normaliseDateTime(parent.latestPublishedDate);
    },
  }
};
