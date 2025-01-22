
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { Affiliation } from '../models/Affiliation';
import { ContributorRole } from '../models/ContributorRole';
import { Project } from '../models/Project';
import { ProjectContributor } from "../models/Contributor";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { hasPermissionOnProject } from '../services/projectService';

export const resolvers: Resolvers = {
  Query: {
    // return all of the contributors for the specified project
    projectContributors: async (_, { projectId }, context: MyContext): Promise<ProjectContributor[]> => {
      const reference = 'projectContributors resolver';
      if (isAuthorized(context.token)) {
        const project = await Project.findById(reference, context, projectId);

        if (project && hasPermissionOnProject(context, project)) {
          return await ProjectContributor.findByProjectId(reference, context, projectId);
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    // return a specific contributor
    projectContributor: async (_, { projectContributorId }, context: MyContext): Promise<ProjectContributor> => {
      const reference = 'projectContributor resolver';
      if (isAuthorized(context.token)) {
        const contributor = await ProjectContributor.findById(reference, context, projectContributorId);
        const project = await Project.findById(reference, context, contributor.projectId);

        if (project && hasPermissionOnProject(context, project)) {
          return contributor;
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
  },

  Mutation: {
    // add a new ProjectContributor
    addProjectContributor: async (_, { input }, context: MyContext) => {
      if (isAuthorized(context.token)) {
        const reference = 'addProjectContributor resolver';
        try {
          const project = await Project.findById(reference, context, input.projectId);
          if (project || !hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          const newContributor = new ProjectContributor(input);
          const created = await newContributor.create(context, project.id);

          if (created && Array.isArray(newContributor.contributorRoles)) {
            // Now add any ContributorRole associations
            for (const role of newContributor.contributorRoles) {
              const newRole = await ContributorRole.findById(reference, context, role.id);
              if (newRole) {
                await newRole.addToProjectContributor(context, created.id);
              }
            }
          }
          return created
        } catch(err) {
          formatLogMessage(context.logger).error(err, `Failure in ${reference}`);
          throw InternalServerError();
        }
      } else {
        throw context?.token ? ForbiddenError() : AuthenticationError();
      }
    },

    editProjectContributor: async (_, { input }, context) => {
      if (isAuthorized(context.token)) {
        const reference = 'editProjectContributor resolver';
        try {
          const contributor = await ProjectContributor.findById(reference, context, input.projectContributorId);
          if (!contributor) {
            throw NotFoundError();
          }

          // Fetch the project and run a permission check
          const project = await Project.findById(reference, context, contributor.projectId);
          if (!hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          const toUpdate = new ProjectContributor(input);
          const updated = await toUpdate.update(context);

          if (!toUpdate.contributorRoles) {
            toUpdate.contributorRoles = [];
          }

          // Delete any ContributorRole associations that were removed
          const domainsToRemove = contributor.contributorRoles.filter((d) => !toUpdate.contributorRoles.includes(d));
          for (const contributorRole of domainsToRemove) {
            const role = await ContributorRole.findById(reference, context, contributorRole.id);
            if (role) {
              role.removeFromProjectContributor(context, updated.id)
            }
          }
          // Add any new ContributorRole associations
          const rolesToAdd = toUpdate.contributorRoles.filter((d) => !contributor.contributorRoles.includes(d));
          for (const contributorRole of rolesToAdd) {
            const role = await ContributorRole.findById(reference, context, contributorRole.id);
            if (role) {
              role.addToProjectContributor(context, updated.id)
            }
          }
          return updated;
        } catch(err) {
          formatLogMessage(context.logger).error(err, `Failure in ${reference}`);
          throw InternalServerError();
        }
      } else {
        throw context?.token ? ForbiddenError() : AuthenticationError();
      }
    },

    removeProjectContributor: async (_, { projectContributorId }, context) => {
      if (isAuthorized(context.token)) {
        const reference = 'removeProjectContributor resolver';
        try {
          const contributor = await ProjectContributor.findById(reference, context, projectContributorId);
          if (!contributor) {
            throw NotFoundError();
          }

          // Fetch the project and run a permission check
          const project = await Project.findById(reference, context, contributor.projectId);
          if (!hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          const deleted = await contributor.delete(context);

          if (deleted && Array.isArray(contributor.contributorRoles)) {
            // Now remove any contributorRole associations
            for (const contributorRole of contributor.contributorRoles) {
              const role = await ContributorRole.findById(reference, context, contributorRole.id);
              if (role) {
                await role.removeFromProjectContributor(context, deleted.id);
              }
            }
          }
          return deleted
        } catch(err) {
          formatLogMessage(context.logger).error(err, `Failure in ${reference}`);
          throw InternalServerError();
        }
      } else {
        throw context?.token ? ForbiddenError() : AuthenticationError();
      }
    },
  },

  ProjectContributor: {
    project: async (parent: ProjectContributor, _, context: MyContext): Promise<Project> => {
      return await Project.findById('Chained ProjectContributor.project', context, parent.projectId);
    },
    affiliation: async (parent: ProjectContributor, _, context: MyContext): Promise<Affiliation> => {
      return await Affiliation.findByURI('Chained ProjectContributor.affiliation', context, parent.affiliationId);
    },
    contributorRoles: async (parent: ProjectContributor, _, context: MyContext): Promise<ContributorRole[]> => {
      return await ContributorRole.findByProjectContributorId(
        'Chained ProjectContributor.contributorRoles',
        context,
        parent.id
      );
    }
  },
};
