
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
import { createPlanVersion, syncWithDMPHub } from '../services/planService';

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

    // add a new plan funder
    addPlanFunder: async (_, { planId, projectFunderId }, context: MyContext): Promise<PlanFunder> => {
      const reference = 'addPlanFunder resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          const project = await Project.findById(reference, context, plan.projectId);
          if (!plan || !project || !hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          // First create a version snapshot (before making changes)
          const newVersion = await createPlanVersion(context, plan, reference);
          if (newVersion) {
            const newFunder = new PlanFunder({ planId, projectFunderId });

            if (newFunder){
              // Asyncronously update the DMPHub
              syncWithDMPHub(context, plan, reference);
            }

            return await newFunder.create(context);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // remove a plan funder
    removePlanFunder: async (_, { planFunderId }, context: MyContext): Promise<PlanFunder> => {
      const reference = 'removePlanFunder resolver';
      try {
        if (isAuthorized(context.token)) {
          const funder = await PlanFunder.findById(reference, context, planFunderId);
          if (!funder) {
            throw NotFoundError();
          }

          const plan = await Plan.findById(reference, context, funder.planId);
          const project = await Project.findById(reference, context, plan.projectId);
          if (!plan || !project || !hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          // First create a version snapshot (before making changes)
          const newVersion = await createPlanVersion(context, plan, reference);
          if (newVersion) {
            const deletedFunder = await funder.delete(context);

            if (deletedFunder){
              // Asyncronously update the DMPHub
              syncWithDMPHub(context, plan, reference);
            }

            return deletedFunder;
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

  ProjectFunder: {
    project: async (parent: ProjectFunder, _, context: MyContext): Promise<Project> => {
      if (parent?.projectId) {
        return await Project.findById('Chained ProjectFunder.project', context, parent.projectId);
      }
      return null;
    },
    affiliation: async (parent: ProjectFunder, _, context: MyContext): Promise<Affiliation> => {
      if (parent?.affiliationId) {
        return await Affiliation.findByURI('Chained ProjectFunder.affiliation', context, parent.affiliationId);
      }
      return null;
    },
  },

  PlanFunder: {
    projectFunder: async (parent: PlanFunder, _, context: MyContext): Promise<ProjectFunder> => {
      if (parent?.projectFunderId) {
        return await ProjectFunder.findById('Chained PlanFunder.projectFunder', context, parent.projectFunderId);
      }
      return null;
    }
  }
};
