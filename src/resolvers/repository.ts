
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { DEFAULT_DMPTOOL_REPOSITORY_URL, Repository, RepositoryType } from "../models/Repository";
import { MyContext } from '../context';
import { isAdmin, isAuthorized, isSuperAdmin } from '../services/authService';
import { ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { ResearchDomain } from '../models/ResearchDomain';
import { stringToEnumValue } from '../utils/helpers';

export const resolvers: Resolvers = {
  Query: {
    // searches the repositories table or returns all repos if no criteria is specified
    repositories: async (_, { input }, context: MyContext): Promise<Repository[]> => {
      const { term, researchDomainId, repositoryType } = input
      return await Repository.search(
        'repositories resolver',
        context,
        term,
        researchDomainId,
        stringToEnumValue(RepositoryType, repositoryType),
      );
    },

    repository: async (_, { uri }, context: MyContext): Promise<Repository> => {
      return await Repository.findByURI('repository resolver', context, uri);
    },
  },

  Mutation: {
    // add a new Repository
    addRepository: async (_, { input }, context: MyContext) => {
      if (isAuthorized(context.token)) {
        try {
          const newRepo = new Repository(input);
          const created = await newRepo.create(context);

          // If any ResearchDomains were specified and there were no errors creating the record
          if (Array.isArray(input.researchDomainIds)) {
            if (created && Array.isArray(created.errors) && created.errors.length === 0){
              // Add any researchDomains associations
              for (const id of input.researchDomainIds) {
                const domain = await ResearchDomain.findById('addRepository resolver', context, id);
                if (domain) {
                  await domain.addToRepository(context, created.id);
                }
              }
            }
          }
          return created
        } catch (err) {
          formatLogMessage(context.logger).error(err, 'Failure in addRepository resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },
    updateRepository: async (_, { input }, context) => {
      const reference = 'updateRepository resolver';
      const repo = await Repository.findById(reference, context, input.id);
      if (!repo) {
        throw NotFoundError();
      }

      // If the user is a an admin and its a DMPTool added repository (no updates to repos managed elsewhere!)
      if (isAdmin(context.token) && repo.uri.startsWith(DEFAULT_DMPTOOL_REPOSITORY_URL)) {
        try {
          const toUpdate = new Repository(input);
          const updated = await toUpdate.update(context);

          if (updated && Array.isArray(updated.errors) && updated.errors.length === 0){
            // Fetch all of the current ResearchDomains associated with this MetadataStandard
            const researchDomains = await ResearchDomain.findByRepositoryId(
              reference,
              context,
              repo.id
            );
            const currentDomainIds = researchDomains ? researchDomains.map((d) => d.id) : [];

            // Use the helper function to determine which ResearchDomains to keep
            const { idsToBeRemoved, idsToBeSaved } = Repository.reconcileAssociationIds(
              currentDomainIds,
              input.researchDomainIds
            );

            // Delete any ResearchDomain associations that were removed
            for (const id of idsToBeRemoved) {
              const dom = await ResearchDomain.findById(reference, context, id);
              if (dom) {
                dom.removeFromRepository(context, updated.id)
              }
            }
            // Add any new ResearchDomain associations
            for (const id of idsToBeSaved) {
              const dom = await ResearchDomain.findById(reference, context, id);
              if (dom) {
                dom.addToRepository(context, updated.id)
              }
            }

            // Reload since the research domains may have changed
            return await Repository.findById(reference, context, repo.id);
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
    removeRepository: async (_, { repositoryId }, context) => {
      const repo = await Repository.findById('updateRepository resolver', context, repositoryId);
      if (!repo) {
        throw NotFoundError();
      }

      // No removal of repositories managed outside the DMP Tool!
      if (isAdmin(context.token) && repo.uri.startsWith(DEFAULT_DMPTOOL_REPOSITORY_URL)) {
        try {
          // TODO: We should do a check to see if it has been used and then either NOT allow the deletion
          //       or notify that it is being done and to what DMPs
          const deleted = await repo.delete(context);
          // No need to remove the related research domain associations the DB will cascade the deletion
          return deleted
        } catch (err) {
          formatLogMessage(context.logger).error(err, 'Failure in removeRepository resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },
    mergeRepositories: async (_, { repositoryToKeepId, repositoryToRemoveId }, context) => {
      if (isSuperAdmin(context.token)) {
        const reference = 'mergeRepositorys resolver';
        try {
          const toKeep = await Repository.findById(reference, context, repositoryToKeepId);
          const toRemove = await Repository.findById(reference, context, repositoryToRemoveId);

          if (!toKeep || !toRemove) {
            throw NotFoundError();
          }
          //No removals of standards managed elsewhere!
          if (!toRemove.uri.startsWith(DEFAULT_DMPTOOL_REPOSITORY_URL)) {
            throw ForbiddenError();
          }

          // Only modify the one we want to keep if it is a DMP Tool managed standard!
          if (!toKeep.uri.startsWith(DEFAULT_DMPTOOL_REPOSITORY_URL)) {
            // Merge the description and website in if the one we want to keep does not have them
            if (!toKeep.description) {
              toKeep.description = toRemove.description
            }
            if (!toKeep.website) {
              toKeep.website = toRemove.description
            }
            // Merge the keywords
            if (toRemove.keywords && Array.isArray(toRemove.keywords)) {
              toRemove.keywords.filter((k) => !toKeep.keywords.includes(k))
                .forEach((key) => toKeep.keywords.push(key));
            }
            // Merge the repositoryTypes
            if (toRemove.repositoryTypes && Array.isArray(toRemove.repositoryTypes)) {
              toRemove.repositoryTypes.filter((rt) => !toKeep.repositoryTypes.includes(rt))
                .forEach((typ) => toKeep.repositoryTypes.push(typ));
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
        } catch (err) {
          formatLogMessage(context.logger).error(err, 'Failure in removeRepository resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },
  },

  Repository: {
    researchDomains: async (parent: Repository, _, context: MyContext): Promise<ResearchDomain[]> => {
      return await ResearchDomain.findByRepositoryId(
        'Chained Repository.researchDomains',
        context,
        parent.id
      );
    },
  },
};
