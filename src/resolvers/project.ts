import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { Project } from "../models/Project";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { ProjectFunder } from '../models/Funder';
import { ProjectContributor } from '../models/Contributor';
import { hasPermissionOnProject } from '../services/projectService';

export const resolvers: Resolvers = {
  Query: {
    // return all of the projects that the current user owns or is a collaborator on
    myProjects: async (_, __, context: MyContext): Promise<Project[]> => {
      if (isAuthorized(context.token)) {
        return await Project.findByUserId('myProjects resolver', context, context.token?.id);
      }
      throw ForbiddenError();
    },

    // Fetch a single project
    project: async (_, { projectId }, context: MyContext): Promise<Project> => {
      if (isAuthorized(context.token)) {
        const project = await Project.findById('project resolver', context, projectId);
        if (hasPermissionOnProject(context, project)) {
          return project;
        }
      }
      throw ForbiddenError();
    },
  },

  Mutation: {
    // add a new Metadata Standard
    addProject: async (_, { title, isTestProject }, context: MyContext) => {
      if (isAuthorized(context.token)) {
        try {
          const newProject = new Project({ title, isTestProject });
          const created = await newProject.create(context);
          return created
        } catch(err) {
          formatLogMessage(context.logger).error(err, 'Failure in addProject resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },

    updateProject: async (_, { input }, context) => {
      if (isAuthorized(context.token)) {
        try {
          const project = await Project.findById('updateProject resolver', context, input.projectId);
          if (!project) {
            throw NotFoundError();
          }
          if (!hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          const toUpdate = new Project(input);
          const updated = await toUpdate.update(context);
          return updated;
        } catch(err) {
          formatLogMessage(context.logger).error(err, 'Failure in updateProject resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },

    archiveProject: async (_, { projectId }, context) => {
      if (isAuthorized(context.token)) {
        try {
          const project = await Project.findById('removeProject resolver', context, projectId);
          if (!project) {
            throw NotFoundError();
          }

          // Only allow the owner of the project to delete it
          if (!hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          // TODO: We need to do a check to see if it has been used and whether any of the related DMPs have
          //       been published
          const deleted = await project.delete(context);
          return deleted
        } catch(err) {
          formatLogMessage(context.logger).error(err, 'Failure in removeProject resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },
  },

  Project: {
    contributors: async (parent: Project, _, context: MyContext): Promise<ProjectContributor[]> => {
      return await ProjectContributor.findByProjectId(
        'Chained Project.contributors',
        context,
        parent.id
      );
    },
    funders: async (parent: Project, _, context: MyContext): Promise<ProjectFunder[]> => {
      return await ProjectFunder.findByProjectId(
        'Chained Project.funders',
        context,
        parent.id
      );
    },
  },
};
