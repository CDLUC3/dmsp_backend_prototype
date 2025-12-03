import { Resolvers } from "../types";
import { MyContext } from "../context";
import { VersionedGuidance } from "../models/VersionedGuidance";
import { VersionedGuidanceGroup } from "../models/VersionedGuidanceGroup";
import { Guidance } from "../models/Guidance";
import { GuidanceGroup } from "../models/GuidanceGroup";
import { AuthenticationError, InternalServerError } from "../utils/graphQLErrors";
import { isAuthorized } from "../services/authService";
import { prepareObjectForLogs } from "../logger";
import { GraphQLError } from "graphql";
import { normaliseDateTime } from "../utils/helpers";

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
    guidanceGroup: async (parent: VersionedGuidanceGroup, _, context: MyContext): Promise<GuidanceGroup> => {
      return await GuidanceGroup.findById('Chained VersionedGuidanceGroup.guidanceGroup', context, parent.guidanceGroupId);
    },
    // Chained resolver to fetch the VersionedGuidance items in this group
    versionedGuidance: async (parent: VersionedGuidanceGroup, _, context: MyContext): Promise<VersionedGuidance[]> => {
      return await VersionedGuidance.findByVersionedGuidanceGroupId(
        'Chained VersionedGuidanceGroup.versionedGuidance',
        context,
        parent.id
      );
    },
    created: (parent: VersionedGuidanceGroup) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: VersionedGuidanceGroup) => {
      return normaliseDateTime(parent.modified);
    },
  },

  VersionedGuidance: {
    // Chained resolver to fetch the VersionedGuidanceGroup this belongs to
    versionedGuidanceGroup: async (parent: VersionedGuidance, _, context: MyContext): Promise<VersionedGuidanceGroup> => {
      return await VersionedGuidanceGroup.findById(
        'Chained VersionedGuidance.versionedGuidanceGroup',
        context,
        parent.versionedGuidanceGroupId
      );
    },
    // Chained resolver to fetch the Guidance this is a snapshot of
    guidance: async (parent: VersionedGuidance, _, context: MyContext): Promise<Guidance> => {
      if (parent.guidanceId) {
        return await Guidance.findById('Chained VersionedGuidance.guidance', context, parent.guidanceId);
      }
      return null;
    },
    created: (parent: VersionedGuidance) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: VersionedGuidance) => {
      return normaliseDateTime(parent.modified);
    },
  }
};
