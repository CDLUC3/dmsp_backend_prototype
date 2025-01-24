
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { DEFAULT_DMPTOOL_METADATA_STANDARD_URL, MetadataStandard } from "../models/MetadataStandard";
import { MyContext } from '../context';
import { isAdmin, isAuthorized, isSuperAdmin } from '../services/authService';
import { ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { ResearchDomain } from '../models/ResearchDomain';

export const resolvers: Resolvers = {
  Query: {
    // searches the metadata standards table or returns all standards if no critieria is specified
    metadataStandards: async (_, { term, researchDomainId }, context: MyContext): Promise<MetadataStandard[]> => {
      return await MetadataStandard.search('metadataStandards resolver', context, term, researchDomainId);
    },

    metadataStandard: async (_, { uri }, context: MyContext): Promise<MetadataStandard> => {
      return await MetadataStandard.findByURI('metadataStandard resolver', context, uri);
    },
  },

  Mutation: {
    // add a new Metadata Standard
    addMetadataStandard: async (_, { input }, context: MyContext) => {
      if (isAuthorized(context.token)) {
        try {
          const newStandard = new MetadataStandard(input);
          const created = await newStandard.create(context);

          // If any ResearchDomains were specified and there were no errors creating the record
          if (Array.isArray(input.researchDomainIds)) {
            if (created && Array.isArray(created.errors) && created.errors.length === 0){
              // Add any researchDomains associations
              for (const id of input.researchDomainIds) {
                const domain = await ResearchDomain.findById('addMetadataStandard resolver', context, id);
                if (domain) {
                  await domain.addToMetadataStandard(context, created.id);
                }
              }
            }
          }
          return created
        } catch(err) {
          formatLogMessage(context.logger).error(err, 'Failure in addMetadataStandard resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },
    updateMetadataStandard: async (_, { input }, context) => {
      const reference = 'updateMetadataStandard resolver';
      // If the user is a an admin and its a DMPTool added standard (no updates to standards managed elsewhere!)
      if (isAdmin(context.token) && input.uri.startsWith(DEFAULT_DMPTOOL_METADATA_STANDARD_URL)) {
        try {
          const standard = await MetadataStandard.findByURI(reference, context, input.uri);
          if (!standard) {
            throw NotFoundError();
          }

          const toUpdate = new MetadataStandard(input);
          const updated = await toUpdate.update(context);

          if (updated && Array.isArray(updated.errors) && updated.errors.length === 0){
            // Fetch all of the current ResearchDomains associated with this MetadataStandard
            const researchDomains = await ResearchDomain.findByMetadataStandardId(
              reference,
              context,
              standard.id
            );
            const currentDomainIds = researchDomains ? researchDomains.map((d) => d.id) : [];

            // Use the helper function to determine which ResearchDomains to keep
            const { idsToBeRemoved, idsToBeSaved } = MetadataStandard.reconcileAssociationIds(
              currentDomainIds,
              input.researchDomainIds
            );

            // Delete any ResearchDomain associations that were removed
            for (const id of idsToBeRemoved) {
              const dom = await ResearchDomain.findById(reference, context, id);
              if (dom) {
                dom.removeFromMetadataStandard(context, updated.id)
              }
            }
            // Add any new ResearchDomain associations
            for (const id of idsToBeSaved) {
              const dom = await ResearchDomain.findById(reference, context, id);
              if (dom) {
                dom.addToMetadataStandard(context, updated.id)
              }
            }

            // Reload since the research domains may have changed
            return await MetadataStandard.findById(reference, context, standard.id);
          }
          // Otherwise there were errors so return the object with errors
          return updated;
        } catch(err) {
          formatLogMessage(context.logger).error(err, `Failure in ${reference}`);
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },

    removeMetadataStandard: async (_, { uri }, context) => {
      // If the user is a an admin and its a DMPTool added standard (no removals of standards managed elsewhere!)
      if (isAdmin(context.token) && uri.startsWith(DEFAULT_DMPTOOL_METADATA_STANDARD_URL)) {
        try {
          const standard = await MetadataStandard.findByURI('removeMetadataStandard resolver', context, uri);
          if (!standard) {
            throw NotFoundError();
          }

          // TODO: We should do a check to see if it has been used and then either NOT allow the deletion
          //       or notify that it is being done and to what DMPs
          const deleted = await standard.delete(context);

          // No need to remove the related research domain associations the DB will cascade the deletion
          return deleted
        } catch(err) {
          formatLogMessage(context.logger).error(err, 'Failure in removeMetadataStandard resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },
    mergeMetadataStandards: async (_, { metadataStandardToKeepId, metadataStandardToRemoveId }, context) => {
      if (isSuperAdmin(context.token)) {
        const reference = 'mergeMetadataStandards resolver';
        try {
          const toKeep = await MetadataStandard.findById(reference, context, metadataStandardToKeepId);
          const toRemove = await MetadataStandard.findById(reference, context, metadataStandardToRemoveId);

          if (!toKeep || !toRemove) {
            throw NotFoundError();
          }
          //No removals of standards managed elsewhere!
          if (!toRemove.uri.startsWith(DEFAULT_DMPTOOL_METADATA_STANDARD_URL)) {
            throw ForbiddenError();
          }

          // Only modify the one we want to keep if it is a DMP Tool managed standard!
          if (!toKeep.uri.startsWith(DEFAULT_DMPTOOL_METADATA_STANDARD_URL)) {
            // Merge the description in if the one we want to keep does not have one
            if (!toKeep.description) {
              toKeep.description = toRemove.description
            }
            // Merge the keywords
            if (toRemove.keywords && Array.isArray(toRemove.keywords)) {
              toRemove.keywords.forEach((keyword) => toKeep.keywords.push(keyword));
            }
            // Merge the researchDomains
            if (toRemove.researchDomains && Array.isArray(toRemove.researchDomains)) {
              toRemove.researchDomains.filter((rd) => !toKeep.researchDomains.includes(rd))
                                      .forEach((dom) => toKeep.researchDomains.push(dom));
            }
            await toKeep.update(context);
          }

          // TODO: We will need to update the identifiers for any project outputs that ref the one being removed!

          // Delete the one we want to remove
          await toRemove.delete(context);
          return toKeep;
        } catch(err) {
          formatLogMessage(context.logger).error(err, 'Failure in removeMetadataStandard resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },
  },

  MetadataStandard: {
    researchDomains: async (parent: MetadataStandard, _, context: MyContext): Promise<ResearchDomain[]> => {
      if (parent.id) {
        return await ResearchDomain.findByMetadataStandardId(
          'Chained MetadataStandard.researchDomains',
          context,
          parent.id
        );
      }
      return [];
    },
  },
};
