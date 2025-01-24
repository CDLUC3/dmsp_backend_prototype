
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
          if (!project || !hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          const newContributor = new ProjectContributor(input);
          const created = await newContributor.create(context, project.id);

          // If any ContributorRole were specified and there were no errors creating the record
          if (Array.isArray(input.contributorRoleIds)) {
            if (created && Array.isArray(created.errors) && created.errors.length === 0){
              // Add any ContributorRole associations
              for (const id of input.contributorRoleIds) {
                const role = await ContributorRole.findById(reference, context, id);
                if (role) {
                  await role.addToProjectContributor(context, created.id);
                }
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

    updateProjectContributor: async (_, { input }, context) => {
      if (isAuthorized(context.token)) {
        const reference = 'updateProjectContributor resolver';
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
          toUpdate.projectId = contributor?.projectId;
          toUpdate.id = contributor?.id;
          const updated = await toUpdate.update(context);

          if (updated && Array.isArray(updated.errors) && updated.errors.length === 0){
            // Fetch all of the current Roles associated with this Contirbutor
            const roles = await ContributorRole.findByProjectContributorId(
              reference,
              context,
              contributor.id
            );
            const currentRoleids = roles ? roles.map((d) => d.id) : [];

            // Use the helper function to determine which Roles to keep
            const { idsToBeRemoved, idsToBeSaved } = ContributorRole.reconcileAssociationIds(
              currentRoleids,
              input.contributorRoleIds
            );

            // Delete any Role associations that were removed
            for (const id of idsToBeRemoved) {
              const role = await ContributorRole.findById(reference, context, id);
              if (role) {
                role.removeFromProjectContributor(context, updated.id)
              }
            }
            // Add any new Role associations
            for (const id of idsToBeSaved) {
              const role = await ContributorRole.findById(reference, context, id);
              if (role) {
                role.addToProjectContributor(context, updated.id)
              }
            }

            // Reload since the roles may have changed
            return await ProjectContributor.findById(reference, context, contributor.id);
          }
          // Otherwise there were errors so return the object with errors
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
