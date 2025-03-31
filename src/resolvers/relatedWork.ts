import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { RelatedWork } from '../models/RelatedWork';
import { GraphQLError } from 'graphql';
import { Project } from '../models/Project';
import { hasPermissionOnProject } from '../services/projectService';
import { Plan } from '../models/Plan';
import { addVersion } from '../models/PlanVersion';

export const resolvers: Resolvers = {
  Query: {
    // Get all the realted works for the Project
    async relatedWorks(_, { projectId }, context: MyContext): Promise<RelatedWork[]> {
      const reference = 'relatedWorks resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);
          if (project && hasPermissionOnProject(context, project)) {
            return await RelatedWork.findByProjectId(reference, context, projectId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    async relatedWork(_, { id }, context: MyContext): Promise<RelatedWork> {
      const reference = 'relatedWork resolver';
      try {
        if (isAuthorized(context.token)) {
          const relatedWork = await RelatedWork.findById(reference, context, id);
          const project = await Project.findById(reference, context, relatedWork.projectId);
          if (project && hasPermissionOnProject(context, project)) {
            return relatedWork;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  Mutation: {
    // Add a related work to a research project
    async addRelatedWork(_, { input }, context: MyContext): Promise<RelatedWork> {
      const reference = 'addRelatedWork resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, input.projectId);
          if (project && hasPermissionOnProject(context, project)) {
            const relatedWork = new RelatedWork(input);
            const newRelatedWork = await relatedWork.create(context);

            if (newRelatedWork && !newRelatedWork.hasErrors()) {
              // Version all of the plans (if any) and sync with the DMPHub
              const plans = await Plan.findByProjectId(reference, context, project.id);
              for (const plan of plans) {
                await addVersion(context, plan, reference);
              }
            }
            return newRelatedWork;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Update a related work on the research project
    async updateRelatedWork(_, { input }, context: MyContext): Promise<RelatedWork> {
      const reference = 'updateRelatedWork resolver';
      try {
        if (isAuthorized(context.token)) {
          const relatedWork = await RelatedWork.findById(reference, context, input.relatedWorkId);
          if (!relatedWork) {
            throw NotFoundError();
          }

          const project = await Project.findById(reference, context, relatedWork.projectId);
          if (project && hasPermissionOnProject(context, project)) {
            const toUpdate = new RelatedWork({ ...relatedWork, ...input });
            const updated = await toUpdate.update(context);

            if(updated && !updated.hasErrors()) {
              // Version all of the plans (if any) and sync with the DMPHub
              const plans = await Plan.findByProjectId(reference, context, project.id);
              for (const plan of plans) {
                await addVersion(context, plan, reference);
              }
            }

            return updated;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Remove a related work from a research project
    async removeRelatedWork(_, { id }, context: MyContext): Promise<RelatedWork> {
      const reference = 'removeRelatedWork resolver';
      try {
        if (isAuthorized(context.token)) {
          const relatedWork = await RelatedWork.findById(reference, context, id);
          if (!relatedWork) {
            throw NotFoundError();
          }

          const project = await Project.findById(reference, context, relatedWork.projectId);
          if (project && hasPermissionOnProject(context, project)) {
            const removed = await relatedWork.delete(context);

            if(removed && !removed.hasErrors()) {
              // Version all of the plans (if any) and sync with the DMPHub
              const plans = await Plan.findByProjectId(reference, context, project.id);
              for (const plan of plans) {
                await addVersion(context, plan, reference);
              }
            }

            return removed;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  }
};
