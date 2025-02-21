
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { Affiliation } from '../models/Affiliation';
import { Project } from '../models/Project';
import { PlanFunder, ProjectFunder } from "../models/Funder";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { hasPermissionOnProject } from '../services/projectService';
import { GraphQLError } from 'graphql';
import { Plan } from '../models/Plan';

export const resolvers: Resolvers = {
  Query: {
    // return all of the funders for the project
    projectFunders: async (_, { projectId }, context: MyContext): Promise<ProjectFunder[]> => {
      const reference = 'projectFunders resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);

          if (project && hasPermissionOnProject(context, project)) {
            return await ProjectFunder.findByProjectId(reference, context, projectId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a single project funder
    projectFunder: async (_, { projectFunderId }, context: MyContext): Promise<ProjectFunder> => {
      const reference = 'projectFunder resolver';
      try {
        if (isAuthorized(context.token)) {
          const projectFunder = await ProjectFunder.findById(reference, context, projectFunderId);
          const project = await Project.findById(reference, context, projectFunder.projectId);

          if (project && hasPermissionOnProject(context, project)) {
            return projectFunder;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    planFunders: async (_, { planId }, context: MyContext): Promise<PlanFunder[]> => {
      const reference = 'planFunders resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          const project = await Project.findById(reference, context, plan.projectId);
          if (plan && hasPermissionOnProject(context, project)) {
            return await PlanFunder.findByPlanId(reference, context, plan.id);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Mutation: {
    // add a new project funder
    addProjectFunder: async (_, { input }, context: MyContext) => {
      const reference = 'addprojectFunder resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, input.projectId);
          if (!project || !hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          const newFunder = new ProjectFunder(input);
          const created = await newFunder.create(context, project.id);

          if (created?.id) {
            return created;
          }

          // A null was returned so add a generic error and return it
          if (!newFunder.errors['general']) {
            newFunder.addError('general', 'Unable to create Funder');
          }
          return newFunder;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing project funder
    updateProjectFunder: async (_, { input }, context) => {
      const reference = 'updateProjectFunder resolver';
      try {
        if (isAuthorized(context.token)) {
          const funder = await ProjectFunder.findById(reference, context, input.projectFunderId);
          if (!funder) {
            throw NotFoundError();
          }

          // Only allow the owner of the project to edit it
          const project = await Project.findById(reference, context, funder.projectId);
          if (!hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          const toUpdate = new ProjectFunder(input);
          toUpdate.projectId = funder?.projectId;
          toUpdate.id = funder?.id;
          toUpdate.affiliationId = funder.affiliationId;
          return await toUpdate.update(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // delete an existing project funder
    removeProjectFunder: async (_, { projectFunderId }, context) => {
      const reference = 'removeProjectFunder resolver';
      try {
        if (isAuthorized(context.token)) {
          const funder = await ProjectFunder.findById(reference, context, projectFunderId);
          if (!funder) {
            throw NotFoundError();
          }

          // Only allow the owner of the project to delete it
          const project = await Project.findById(reference, context, funder.projectId);
          if (!hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          return await funder.delete(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  ProjectFunder: {
    project: async (parent: ProjectFunder, _, context: MyContext): Promise<Project> => {
      return await Project.findById('Chained ProjectFunder.project', context, parent.projectId);
    },
    affiliation: async (parent: ProjectFunder, _, context: MyContext): Promise<Affiliation> => {
      return await Affiliation.findByURI('Chained ProjectFunder.affiliation', context, parent.affiliationId);
    },
  },
};
