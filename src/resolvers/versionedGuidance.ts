import { Resolvers } from "../types.js";
import { MyContext } from "../context.js";
import { VersionedGuidance } from "../models/VersionedGuidance.js";
import { VersionedGuidanceGroup } from "../models/VersionedGuidanceGroup.js";
import { Guidance } from "../models/Guidance.js";
import { GuidanceGroup } from "../models/GuidanceGroup.js";
import { AuthenticationError, InternalServerError } from "../utils/graphQLErrors.js";
import { isAuthorized } from "../services/authService.js";
import { prepareObjectForLogs } from "../logger.js";
import { GraphQLError } from "graphql";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";

export const resolvers: Resolvers = {
  Query: {
    // Get best practice VersionedGuidance for given Tag IDs
    bestPracticeGuidance: async (_, { tagIds }, context: MyContext): Promise<VersionedGuidance[]> => {
      const reference = 'bestPracticeGuidance resolver';
      try {
        if (isAuthorized(context?.token)) {
          return await VersionedGuidance.findBestPracticeByTagIds(reference, context, tagIds);
        }

        throw AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Get all VersionedGuidance for a given affiliation and Tag IDs
    versionedGuidance: async (_, { affiliationId, tagIds }, context: MyContext): Promise<VersionedGuidance[]> => {
      const reference = 'versionedGuidance resolver';
      try {
        if (isAuthorized(context?.token)) {
          return await VersionedGuidance.findByAffiliationAndTagIds(reference, context, affiliationId, tagIds);
        }

        throw AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  VersionedGuidanceGroup: {
    // Chained resolver to fetch the GuidanceGroup this is a snapshot of
    guidanceGroup: async (parent, _, context: MyContext): Promise<GuidanceGroup | null> => {
      if (isNullOrUndefined(parent.guidanceGroupId)) {
        return null;
      }
      return await GuidanceGroup.findById('Chained VersionedGuidanceGroup.guidanceGroup', context, parent.guidanceGroupId);
    },
    // Chained resolver to fetch the VersionedGuidance items in this group
    versionedGuidance: async (parent, _, context: MyContext): Promise<VersionedGuidance[]> => {
      if (isNullOrUndefined(parent.id)) {
        return [];
      }
      return await VersionedGuidance.findByVersionedGuidanceGroupId(
        'Chained VersionedGuidanceGroup.versionedGuidance',
        context,
        parent.id
      );
    },
    // `parent` is contextually typed as the generated type (not the model class) here,
    // which is all `created`/`modified` need.
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    },
  },

  VersionedGuidance: {
    // Chained resolver to fetch the VersionedGuidanceGroup this belongs to
    versionedGuidanceGroup: async (parent, _, context: MyContext): Promise<VersionedGuidanceGroup | null> => {
      if (isNullOrUndefined(parent.versionedGuidanceGroupId)) {
        return null;
      }
      return await VersionedGuidanceGroup.findById(
        'Chained VersionedGuidance.versionedGuidanceGroup',
        context,
        parent.versionedGuidanceGroupId
      );
    },
    // Chained resolver to fetch the Guidance this is a snapshot of
    guidance: async (parent, _, context: MyContext): Promise<Guidance | null> => {
      if (parent.guidanceId) {
        return await Guidance.findById('Chained VersionedGuidance.guidance', context, parent.guidanceId);
      }
      return null;
    },
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    },
  }
};
