import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { RelatedWork } from '../models/RelatedWork';
import { GraphQLError } from 'graphql';
import { Project } from '../models/Project';
import { hasPermissionOnProject } from '../services/projectService';

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

            // TODO: We need to generate the plan version snapshot and sync with DMPHub for each plan

            return await relatedWork.create(context);
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

            // TODO: We need to generate the plan version snapshot and sync with DMPHub for each plan

            return await toUpdate.update(context);
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

            // TODO: We need to generate the plan version snapshot and sync with DMPHub for each plan

            return await relatedWork.delete(context);
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
