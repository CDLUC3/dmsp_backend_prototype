import { prepareObjectForLogs } from '../logger';
import { RelatedWorkSearchResults, Resolvers } from '../types';
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { RelatedWorkSearchResult, RelatedWork, Work, WorkVersion } from '../models/RelatedWork';
import { GraphQLError } from 'graphql';
import { Project } from '../models/Project';
import { hasPermissionOnProject } from '../services/projectService';
import { Plan } from '../models/Plan';
import { isNullOrUndefined, normaliseDateTime } from '../utils/helpers';
import { PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from '../types/general';

export const resolvers: Resolvers = {
  Query: {
    // Get all the related works for a plan
    async relatedWorksByProject(
      _,
      { projectId, filterOptions, paginationOptions },
      context: MyContext,
    ): Promise<RelatedWorkSearchResults> {
      const reference = 'relatedWorksByProject resolver';
      try {
        if (isAuthorized(context.token)) {
          const pagOpts =
            !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
              ? (paginationOptions as PaginationOptionsForOffsets)
              : ({ ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors);
          const project = await Project.findById(reference, context, projectId);
          if (project && (await hasPermissionOnProject(context, project))) {
            return await RelatedWorkSearchResult.search(
              reference,
              context,
              projectId,
              undefined,
              filterOptions,
              pagOpts,
            );
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Get all the related works for a plan
    async relatedWorksByPlan(
      _,
      { planId, filterOptions, paginationOptions },
      context: MyContext,
    ): Promise<RelatedWorkSearchResults> {
      const reference = 'relatedWorksByPlan resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (plan) {
            const pagOpts =
              !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
                ? (paginationOptions as PaginationOptionsForOffsets)
                : ({ ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors);
            const project = await Project.findById(reference, context, plan.projectId);
            if (project && (await hasPermissionOnProject(context, project))) {
              return await RelatedWorkSearchResult.search(
                reference,
                context,
                plan.projectId,
                planId,
                filterOptions,
                pagOpts,
              );
            }
          }
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
    // Add a related work to a research project
    async addRelatedWork(_, { input }, context: MyContext): Promise<RelatedWorkSearchResult> {
      const reference = 'addRelatedWork resolver';
      try {
        if (isAuthorized(context.token)) {
          // Check if user has permission to modify project
          const plan = await Plan.findById(reference, context, input.planId);
          if (plan) {
            const project = await Project.findById(reference, context, plan.projectId);
            if (project && (await hasPermissionOnProject(context, project))) {
              // Fetch or create work
              let work = await Work.findByDoi(reference, context, input.doi);
              if (!work) {
                work = new Work({ doi: input.doi });
                work = await work.create(context);
              }

              // Fetch or create work version
              let workVersion = await WorkVersion.findByDoiAndHash(reference, context, input.doi, input.hash);
              if (!workVersion) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { planId, doi, ...options } = input;
                workVersion = new WorkVersion(options);
                workVersion.workId = work.id;
                workVersion = await workVersion.create(context, work.doi);
              }
              if (isNullOrUndefined(workVersion) || workVersion.hasErrors())
              {
                throw InternalServerError('Unable to create or find workVersion');
              }

              // Create related work
              let relatedWork = new RelatedWork({
                planId: input.planId,
                workVersionId: workVersion.id,
                status: 'ACCEPTED',
                score: 1.0,
                maxScore: 1.0,
                sourceType: 'USER_ADDED',
              });
              relatedWork = await relatedWork.create(context);
              if (isNullOrUndefined(relatedWork.id)) {
                throw InternalServerError('Unable to create related work');
              }

              // Fetch and return RelatedWorkSearchResult
              return await RelatedWorkSearchResult.findById(reference, context, relatedWork.id);
            }
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Update a related work status on the research project
    async updateRelatedWorkStatus(_, { input }, context: MyContext): Promise<RelatedWorkSearchResult> {
      const reference = 'updateRelatedWorkStatus resolver';
      try {
        if (isAuthorized(context.token)) {
          const relatedWork = await RelatedWork.findById(reference, context, input.id);
          if (!relatedWork) {
            throw NotFoundError('Related work not found');
          }

          const plan = await Plan.findById(reference, context, relatedWork.planId);
          if (!plan) {
            throw NotFoundError('Plan not found');
          }

          const project = await Project.findById(reference, context, plan.projectId);
          if (project && (await hasPermissionOnProject(context, project))) {
            let toUpdate = new RelatedWork({ ...relatedWork, ...input });
            toUpdate = await toUpdate.update(context);

            // Fetch and return RelatedWorkSearchResult
            return await RelatedWorkSearchResult.findById(reference, context, toUpdate.id);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
  RelatedWorkSearchResult: {
    created: (parent: RelatedWork) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: RelatedWork) => {
      return normaliseDateTime(parent.modified);
    },
  },
};
