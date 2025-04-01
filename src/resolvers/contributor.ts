
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { Affiliation } from '../models/Affiliation';
import { ContributorRole } from '../models/ContributorRole';
import { Project } from '../models/Project';
import { PlanContributor, ProjectContributor } from "../models/Contributor";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { hasPermissionOnProject } from '../services/projectService';
import { updateContributorRoles } from '../services/planService';
import { GraphQLError } from 'graphql';
import { Plan } from '../models/Plan';

export const resolvers: Resolvers = {
  Query: {
    // return all of the contributors for the specified project
    projectContributors: async (_, { projectId }, context: MyContext): Promise<ProjectContributor[]> => {
      const reference = 'projectContributors resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);

          if (project && hasPermissionOnProject(context, project)) {
            return await ProjectContributor.findByProjectId(reference, context, projectId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a specific contributor
    projectContributor: async (_, { projectContributorId }, context: MyContext): Promise<ProjectContributor> => {
      const reference = 'projectContributor resolver';
      try {
        if (isAuthorized(context.token)) {
          const contributor = await ProjectContributor.findById(reference, context, projectContributorId);
          const project = await Project.findById(reference, context, contributor.projectId);

          if (project && hasPermissionOnProject(context, project)) {
            return contributor;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    planContributors: async (_, { planId }, context: MyContext): Promise<PlanContributor[]> => {
      const reference = 'planContributors resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          const project = await Project.findById(reference, context, plan.projectId);
          if (plan && hasPermissionOnProject(context, project)) {
            return await PlanContributor.findByPlanId(reference, context, plan.id);
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
    // add a new ProjectContributor
    addProjectContributor: async (_, { input }, context: MyContext) => {
      const reference = 'addProjectContributor resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, input.projectId);
          if (!project || !hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          const newContributor = new ProjectContributor(input);
          const created = await newContributor.create(context, project.id);

          if (!created?.id) {
            // A null was returned so add a generic error and return it
            if (!newContributor.errors['general']) {
              newContributor.addError('general', 'Unable to create Contributor');
            }
            return newContributor;
          }

          // If any ContributorRole were specified and there were no errors creating the record
          if (Array.isArray(input.contributorRoleIds)) {
            if (created && !created.hasErrors()) {
              const addErrors = [];
              // Add any ContributorRole associations
              for (const id of input.contributorRoleIds) {
                const role = await ContributorRole.findById(reference, context, id);
                if (role) {
                  const wasAdded = await role.addToProjectContributor(context, created.id);
                  if (!wasAdded) {
                    addErrors.push(role.label);
                  }
                }
              }
              // If any failed to be added, then add an error to the ProjectContributor
              if (addErrors.length > 0) {
                created.addError('contributorRoles', `Created but unable to assign roles: ${addErrors.join(', ')}`);
              }
            }
          }
          return created
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing ProjectContributor
    updateProjectContributor: async (_, { input }, context) => {
      const reference = 'updateProjectContributor resolver';
      try {
        if (isAuthorized(context.token)) {
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

          if (updated && !updated.hasErrors()) {
            const associationErrors = [];
            // Fetch all of the current Roles associated with this Contirbutor
            const roles = await ContributorRole.findByProjectContributorId(reference, context, contributor.id);
            const currentRoleids = roles ? roles.map((d) => d.id) : [];

            // Use the helper function to determine which Roles to keep
            const { idsToBeRemoved, idsToBeSaved } = ContributorRole.reconcileAssociationIds(
              currentRoleids,
              input.contributorRoleIds
            );

            const removeErrors = [];
            // Delete any Role associations that were removed
            for (const id of idsToBeRemoved) {
              const role = await ContributorRole.findById(reference, context, id);
              if (role) {
                const wasRemoved = role.removeFromProjectContributor(context, updated.id);
                if (!wasRemoved) {
                  removeErrors.push(role.label);
                }
              }
            }
            // If any failed to be removed, then add an error to the ProjectContributor
            if (removeErrors.length > 0) {
              associationErrors.push(`unable to remove roles: ${removeErrors.join(', ')}`);
            }

            const addErrors = [];
            // Add any new Role associations
            for (const id of idsToBeSaved) {
              const role = await ContributorRole.findById(reference, context, id);
              if (role) {
                const wasAdded = role.addToProjectContributor(context, updated.id);
                if (!wasAdded) {
                  addErrors.push(role.label);
                }
              }
            }
            // If any failed to be added, then add an error to the ProjectContributor
            if (addErrors.length > 0) {
              associationErrors.push(`unable to assign roles: ${addErrors.join(', ')}`);
            }

            if (associationErrors.length > 0) {
              updated.addError('contributorRoles', `Updated but ${associationErrors.join(', ')}`);
            }
            // Reload since the roles may have changed
            return updated.hasErrors() ? updated : await ProjectContributor.findById(reference, context, contributor.id);
          }
          // Otherwise there were errors so return the object with errors
          return updated;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // delete an existing ProjectContributor
    removeProjectContributor: async (_, { projectContributorId }, context) => {
      const reference = 'removeProjectContributor resolver';
      try {
        if (isAuthorized(context.token)) {
          const contributor = await ProjectContributor.findById(reference, context, projectContributorId);
          if (!contributor) {
            throw NotFoundError();
          }

          // Fetch the project and run a permission check
          const project = await Project.findById(reference, context, contributor.projectId);
          if (!hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          // Any related contributorRoles will be automatically deleted within the DB
          return await contributor.delete(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    //Add a Contributor to a Plan
    addPlanContributor: async (_, { planId, projectContributorId, roleIds }, context: MyContext): Promise<PlanContributor> => {
      const reference = 'addPlanContributor resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          const projectContributor = await ProjectContributor.findById(reference, context, projectContributorId);

          // For now, planContributor roles will match the projectContributor roles
          const roles = await ContributorRole.findByProjectContributorId(reference, context, projectContributorId);
          const currentProjectRoleIds = roles ? roles.map((d) => d.id) : [];

          if (!plan || !projectContributor) {
            throw NotFoundError();
          }

          const project = await Project.findById(reference, context, projectContributor.projectId);
          if (hasPermissionOnProject(context, project)) {
            const newPlanContributor = new PlanContributor({ planId, projectContributorId, contributorRoleIds: currentProjectRoleIds });
            const created = await newPlanContributor.create(context);

            if (!created?.id) {
              // A null was returned so add a generic error and return it
              if (!newPlanContributor.errors['general']) {
                newPlanContributor.addError('general', 'Unable to create PlanContributor');
              }
              return newPlanContributor;
            }

            // If any ContributorRole were specified and there were no errors creating the record
            if (Array.isArray(roleIds)) {
              if (created && !created.hasErrors()) {
                const addErrors = [];
                // Add any ContributorRole associations
                for (const id of roleIds) {
                  const role = await ContributorRole.findById(reference, context, id);
                  if (role) {
                    const wasAdded = await role.addToPlanContributor(context, created.id);
                    if (!wasAdded) {
                      addErrors.push(role.label);
                    }
                  }
                }
                // If any failed to be added, then add an error to the PlanContributor
                if (addErrors.length > 0) {
                  created.addError('contributorRoles', `Created but unable to assign roles: ${addErrors.join(', ')}`);
                }
              }
            }

            // TODO: We need to generate the plan version snapshot and sync with DMPHub

            return created;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing PlanContributor
    updatePlanContributor: async (_, { planId, planContributorId, contributorRoleIds, isPrimaryContact }, context) => {
      const reference = 'updatePlanContributor resolver';
      try {
        if (isAuthorized(context.token)) {
          const contributor = await PlanContributor.findById(reference, context, planContributorId);
          if (!contributor) {
            throw NotFoundError();
          }

          const projectContributor = await ProjectContributor.findById(reference, context, contributor.projectContributorId);
          const project = await Project.findById(reference, context, projectContributor.projectId);
          const hasPermission = await hasPermissionOnProject(context, project);

          if (hasPermission) {
            // Fetch current roles
            const roles = await ContributorRole.findByPlanContributorId(reference, context, planContributorId);
            const currentRoleIds = roles ? roles.map((d) => d.id) : [];

            // Update roles using the helper function
            const { updatedRoleIds, errors } = await updateContributorRoles(
              reference,
              context,
              contributor.id,
              currentRoleIds,
              contributorRoleIds
            );

            if (errors.length > 0) {
              contributor.addError('contributorRoles', `Updated but ${errors.join(', ')}`);
            }

            // Create a new instance of PlanContributor and set the updated values
            const toUpdate = new PlanContributor({
              id: planContributorId,
              planId: planId,
              projectContributorId: projectContributor.id,
              isPrimaryContact,
              contributorRoleIds: updatedRoleIds ?? currentRoleIds,
            });

            //update the PlanContributor with new instance
            const updatedPlan = await toUpdate.update(context);

            // Make updates for isPrimaryContact
            if (updatedPlan && !updatedPlan.hasErrors()) {
              if (isPrimaryContact === true) {
                // Get all contributors for the plan
                const allContributors = await PlanContributor.findByPlanId(reference, context, planId);

                // Set isPrimaryContact to false for all other contributors
                for (const contributor of allContributors) {
                  if (contributor.id !== planContributorId) {
                    contributor.isPrimaryContact = false;
                    // Fetch current roles
                    const roles = await ContributorRole.findByPlanContributorId(reference, context, contributor.id);
                    const roleIds = roles ? roles.map((d) => d.id) : [];
                    contributor.contributorRoleIds = roleIds;
                    await contributor.update(context);
                  }
                }
              }

              // Update the current contributor's isPrimaryContact field
              updatedPlan.isPrimaryContact = isPrimaryContact;
              updatedPlan.contributorRoleIds = updatedRoleIds ?? [];
              await updatedPlan.update(context);
            }

            return await PlanContributor.findById(reference, context, contributor.id);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // delete an existing PlanContributor
    removePlanContributor: async (_, { planContributorId }, context) => {
      const reference = 'removePlanContributor resolver';
      try {
        if (isAuthorized(context.token)) {
          const contributor = await PlanContributor.findById(reference, context, planContributorId);
          if (!contributor) {
            throw NotFoundError();
          }

          // Fetch the project and run a permission check
          const projectContributor = await ProjectContributor.findById(
            reference,
            context,
            contributor.projectContributorId
          );
          const project = await Project.findById(reference, context, projectContributor.projectId);
          if (!hasPermissionOnProject(context, project)) {
            throw ForbiddenError();
          }

          // TODO: We need to generate the plan version snapshot and sync with DMPHub

          // Any related contributorRoles will be automatically deleted within the DB
          return await contributor.delete(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  ProjectContributor: {
    project: async (parent: ProjectContributor, _, context: MyContext): Promise<Project> => {
      if (parent?.projectId) {
        return await Project.findById('Chained ProjectContributor.project', context, parent.projectId);
      }
      return null;
    },
    affiliation: async (parent: ProjectContributor, _, context: MyContext): Promise<Affiliation> => {
      if (parent?.affiliationId) {
        return await Affiliation.findByURI('Chained ProjectContributor.affiliation', context, parent.affiliationId);
      }
      return null;
    },
    contributorRoles: async (parent: ProjectContributor, _, context: MyContext): Promise<ContributorRole[]> => {
      if (parent?.id) {
        return await ContributorRole.findByProjectContributorId(
          'Chained ProjectContributor.contributorRoles',
          context,
          parent.id
        );
      }
      return null;
    }
  },

  PlanContributor: {
    projectContributor: async (parent: PlanContributor, _, context: MyContext): Promise<ProjectContributor> => {
      if (parent?.projectContributorId) {
        return await ProjectContributor.findById(
          'Chained PlanContributor.projectContributor',
          context, parent.projectContributorId
        );
      }
      return null;
    },
    contributorRoles: async (parent: ProjectContributor, _, context: MyContext): Promise<ContributorRole[]> => {
      if (parent?.id) {
        return await ContributorRole.findByPlanContributorId(
          'Chained ProjectContributor.contributorRoles',
          context,
          parent.id
        );
      }
      return null;
    },
  },
};
