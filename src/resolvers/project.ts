import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { Project } from "../models/Project";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { ProjectFunder } from '../models/Funder';
import { ProjectContributor } from '../models/Contributor';
import { hasPermissionOnProject } from '../services/projectService';
import { ResearchDomain } from '../models/ResearchDomain';
import { ProjectOutput } from '../models/Output';
import { GraphQLError } from 'graphql';
import { Plan, PlanSearchResult } from '../models/Plan';
import { addVersion } from '../models/PlanVersion';

export const resolvers: Resolvers = {
  Query: {
    // return all of the projects that the current user owns or is a collaborator on
    myProjects: async (_, __, context: MyContext): Promise<Project[]> => {
      const reference = 'myProjects resolver';
      try {
        if (isAuthorized(context.token)) {
          return await Project.findByUserId(reference, context, context.token?.id);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Fetch a single project
    project: async (_, { projectId }, context: MyContext): Promise<Project> => {
      const reference = 'project resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);
          if (await hasPermissionOnProject(context, project)) {
            return project;
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
    // add a new project
    addProject: async (_, { title, isTestProject }, context: MyContext) => {
      const reference = 'addProject resolver';
      try {
        if (isAuthorized(context.token)) {
          try {
            const newProject = new Project({ title, isTestProject });
            const created = await newProject.create(context);

            if (created?.id) {
              return created;
            }

            // A null was returned so add a generic error and return it
            if (!newProject.errors['general']) {
              newProject.addError('general', 'Unable to create Project');
            }
            return newProject;
          } catch (err) {
            formatLogMessage(context).error(err, `Failure in ${reference}`);
            throw InternalServerError();
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update a project
    updateProject: async (_, { input }, context) => {
      const reference = 'updateProject resolver';
      try {
        if (isAuthorized(context.token)) {
          try {
            const project = await Project.findById(reference, context, input.id);
            if (!project) {
              throw NotFoundError();
            }

            if (!(await hasPermissionOnProject(context, project))) {
              throw ForbiddenError();
            }

            const toUpdate = new Project(input);
            const updated = await toUpdate.update(context);
            if (updated && !updated.hasErrors()) {
              // Update each plan's version snapshot if the project was updated
              const plans = await Plan.findByProjectId(reference, context, project.id);
              for (const plan of plans) {
                await addVersion(context, plan, reference);
              }
            }

            return updated;
          } catch (err) {
            formatLogMessage(context).error(err, `Failure in ${reference}`);
            throw InternalServerError();
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // archive a project
    archiveProject: async (_, { projectId }, context) => {
      const reference = 'archiveProject resolver';
      try {
        if (isAuthorized(context.token)) {
          try {
            const project = await Project.findById(reference, context, projectId);
            if (!project) {
              throw NotFoundError();
            }

            // Only allow the owner of the project to delete it
            if (!(await hasPermissionOnProject(context, project))) {
              throw ForbiddenError();
            }

            // Delete/Tombstone each plan associated with the project
            const plans = await Plan.findByProjectId(reference, context, project.id);
            for (const plan of plans) {
              plan.delete(context);
            }

            return await project.delete(context);
          } catch (err) {
            formatLogMessage(context).error(err, `Failure in ${reference}`);
            throw InternalServerError();
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

  Project: {
    researchDomain: async (parent: Project, _, context: MyContext): Promise<ResearchDomain | null> => {
      if (parent.researchDomainId) {
        return await ResearchDomain.findById(
          'Chained Project.researchDomain',
          context,
          parent.researchDomainId
        );
      }
      return null;
    },
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
    outputs: async (parent: Project, _, context: MyContext): Promise<ProjectOutput[]> => {
      return await ProjectOutput.findByProjectId(
        'Chained Project.outputs',
        context,
        parent.id
      );
    },
    plans: async (parent: Project, _, context: MyContext): Promise<PlanSearchResult[]> => {
      return await PlanSearchResult.findByProjectId(
        'Chained Project.plans',
        context,
        parent.id
      );
    },
  },
};
