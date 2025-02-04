
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { Affiliation } from '../models/Affiliation';
import { Project } from '../models/Project';
import { ProjectFunder } from "../models/Funder";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { hasPermissionOnProject } from '../services/projectService';

export const resolvers: Resolvers = {
  Query: {
    // return all of the funders for the project
    projectFunders: async (_, { projectId }, context: MyContext): Promise<ProjectFunder[]> => {
      const reference = 'projectFunders resolver';
      if (isAuthorized(context.token)) {
        const project = await Project.findById(reference, context, projectId);

        if (project && hasPermissionOnProject(context, project)) {
          return await ProjectFunder.findByProjectId(reference, context, projectId);
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    projectFunder: async (_, { projectFunderId }, context: MyContext): Promise<ProjectFunder> => {
      const reference = 'projectFunder resolver';
      if (isAuthorized(context.token)) {
        const projectFunder = await ProjectFunder.findById(reference, context, projectFunderId);
        const project = await Project.findById(reference, context, projectFunder.projectId);

        if (project && hasPermissionOnProject(context, project)) {
          return projectFunder;
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
  },

  Mutation: {
    // add a new ProjectFunder
    addProjectFunder: async (_, { input }, context: MyContext) => {
      if (isAuthorized(context.token)) {
        const reference = 'addprojectFunder resolver';
        try {
          const project = await Project.findById(reference, context, input.projectId);
          if (!project || !hasPermissionOnProject(context, project)) throw ForbiddenError();

          const newFunder = new ProjectFunder(input);
          return await newFunder.create(context, project.id);
        } catch(err) {
          formatLogMessage(context).error(err, `Failure in ${reference}`);
          throw InternalServerError();
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    updateProjectFunder: async (_, { input }, context) => {
      if (isAuthorized(context.token)) {
        const reference = 'updateProjectFunder resolver';
        try {
          const funder = await ProjectFunder.findById(reference, context, input.projectFunderId);
          if (!funder) throw NotFoundError();

          // Only allow the owner of the project to edit it
          const project = await Project.findById(reference, context, funder.projectId);
          if (!hasPermissionOnProject(context, project)) throw ForbiddenError();

          const toUpdate = new ProjectFunder(input);
          toUpdate.projectId = funder?.projectId;
          toUpdate.id = funder?.id;
          toUpdate.affiliationId = funder.affiliationId;
          return await toUpdate.update(context);
        } catch(err) {
          formatLogMessage(context).error(err, `Failure in ${reference}`);
          throw InternalServerError();
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    removeProjectFunder: async (_, { projectFunderId }, context) => {
      if (isAuthorized(context.token)) {
        const reference = 'removeProjectFunder resolver';
        try {
          const funder = await ProjectFunder.findById(reference, context, projectFunderId);
          if (!funder) throw NotFoundError();

          // Only allow the owner of the project to delete it
          const project = await Project.findById(reference, context, funder.projectId);
          if (!hasPermissionOnProject(context, project)) throw ForbiddenError();

          return await funder.delete(context);
        } catch(err) {
          formatLogMessage(context).error(err, `Failure in ${reference}`);
          throw InternalServerError();
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
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
