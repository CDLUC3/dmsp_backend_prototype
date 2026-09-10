import { prepareObjectForLogs } from '../logger.js';
import { Affiliation as AffiliationGQL, Resolvers } from "../types.js";
import { Affiliation } from '../models/Affiliation.js';
import { MemberRole } from '../models/MemberRole.js';
import { Project } from '../models/Project.js';
import { PlanMember, ProjectMember } from "../models/Member.js";
import { MyContext } from '../context.js';
import { isAuthorized } from '../services/authService.js';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors.js';
import { hasPermissionOnProject } from '../services/projectService.js';
import { handleAsyncUpdates, updateMemberRoles } from '../services/planService.js';
import { GraphQLError } from 'graphql';
import { Plan } from '../models/Plan.js';
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";
import { ProjectCollaboratorAccessLevel } from "../models/Collaborator.js";
import { resolveAffiliation } from '../services/affiliationService.js';


export const resolvers: Resolvers = {
  Query: {
    // return all of the members for the specified project
    projectMembers: async (_, { projectId }, context: MyContext): Promise<ProjectMember[]> => {
      const reference = 'projectMembers resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);
          if (isNullOrUndefined(project)) {
            throw NotFoundError();
          }

          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
            return await ProjectMember.findByProjectId(reference, context, projectId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;
        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // return a specific member
    projectMember: async (_, { projectMemberId }, context: MyContext): Promise<ProjectMember> => {
      const reference = 'projectMember resolver';
      try {
        if (isAuthorized(context.token)) {
          const member = await ProjectMember.findById(reference, context, projectMemberId);
          if (isNullOrUndefined(member)) {
            throw NotFoundError();
          }

          const project = await Project.findById(reference, context, member.projectId);

          if (project && await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
            return member;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    planMembers: async (_, { planId }, context: MyContext): Promise<PlanMember[]> => {
      const reference = 'planMembers resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (isNullOrUndefined(plan) || isNullOrUndefined(plan.id)) {
            throw NotFoundError();
          }

          const project = await Project.findById(reference, context, plan.projectId);
          if (isNullOrUndefined(project)) {
            throw NotFoundError();
          }
          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
            return await PlanMember.findByPlanId(reference, context, plan.id);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Mutation: {
    // add a new ProjectMember
    addProjectMember: async (_, { input }, context: MyContext) => {
      const reference = 'addProjectMember resolver';
      try {
        if (isAuthorized(context.token)) {
          if (isNullOrUndefined(input.projectId)) {
            throw NotFoundError();
          }
          const project = await Project.findById(reference, context, input.projectId);
          if (isNullOrUndefined(project) || isNullOrUndefined(project.id)) {
            throw NotFoundError();
          }

          const { affiliationId, error } = await resolveAffiliation(reference, context, input, context.token.id);
          if (error) {
            const errorMember = new ProjectMember({
              projectId: input.projectId,
              affiliationId: input.affiliationId ?? undefined,
              givenName: input.givenName ?? undefined,
              surName: input.surName ?? undefined,
              orcid: input.orcid ?? undefined,
              email: input.email ?? undefined,
            });
            errorMember.addError('affiliation', error);
            return errorMember;
          }
          input.affiliationId = affiliationId;

          if (await hasPermissionOnProject(context, project)) {
            const newMember = new ProjectMember({
              projectId: input.projectId,
              affiliationId: input.affiliationId ?? undefined,
              givenName: input.givenName ?? undefined,
              surName: input.surName ?? undefined,
              orcid: input.orcid ?? undefined,
              email: input.email ?? undefined,
            });
            const created = await newMember.create(context, project.id);

            if (isNullOrUndefined(created?.id)) {
              // A null was returned so add a generic error and return it
              if (isNullOrUndefined(newMember.errors['general'])) {
                newMember.addError('general', 'Unable to create Member');
              }
              return newMember;
            }

            // If any MemberRole were specified and there were no errors creating the record
            if (Array.isArray(input.memberRoleIds)) {
              if (created && !created.hasErrors()) {
                const addErrors = [];
                // Add any memberRole associations
                for (const id of input.memberRoleIds) {
                  const role = await MemberRole.findById(reference, context, id);
                  if (role) {
                    const wasAdded = await role.addToProjectMember(context, created.id);
                    if (!wasAdded) {
                      addErrors.push(role.label);
                    }
                  }
                }
                // If any failed to be added, then add an error to the ProjectMember
                if (addErrors.length > 0) {
                  created.addError('memberRoles', `Created but unable to assign roles: ${addErrors.join(', ')}`);
                }
              }
            } else {
              // Since no roles were provided, we will default to one
              const role = await MemberRole.defaultRole(context, reference);
              if (role) {
                await role.addToProjectMember(context, created.id);
              }
            }

            return created;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing ProjectMember
    updateProjectMember: async (_, { input }, context) => {
      const reference = 'updateProjectMember resolver';
      try {
        if (isAuthorized(context.token)) {
          const member = await ProjectMember.findById(reference, context, input.projectMemberId);
          if (isNullOrUndefined(member) || isNullOrUndefined(member.id)) {
            throw NotFoundError();
          }

          // Fetch the project and run a permission check
          const project = await Project.findById(reference, context, member.projectId);
          if (isNullOrUndefined(project)) {
            throw NotFoundError();
          }


          const { affiliationId, error } = await resolveAffiliation(reference, context, input, context.token.id);
          if (error) {
            const errorMember = new ProjectMember({
              projectId: member.projectId,
              affiliationId: input.affiliationId ?? undefined,
              givenName: input.givenName ?? undefined,
              surName: input.surName ?? undefined,
              orcid: input.orcid ?? undefined,
              email: input.email ?? undefined,
            });
            errorMember.addError('affiliationId', error);
            return errorMember;
          }
          input.affiliationId = affiliationId;

          if (await hasPermissionOnProject(context, project)) {
            const toUpdate = new ProjectMember({
              projectId: member.projectId,
              affiliationId: input.affiliationId ?? undefined,
              givenName: input.givenName ?? undefined,
              surName: input.surName ?? undefined,
              orcid: input.orcid ?? undefined,
              email: input.email ?? undefined,
            });
            toUpdate.projectId = member.projectId;
            toUpdate.id = member.id;
            const updated = await toUpdate.update(context);

            if (updated && !updated.hasErrors() && !isNullOrUndefined(updated.id)) {
              const updatedId = updated.id;
              const associationErrors = [];
              // Fetch all of the current Roles associated with this Contirbutor
              const roles = await MemberRole.findByProjectMemberId(reference, context, member.id);
              const currentRoleids = roles
                .map((d) => d.id)
                .filter((id): id is number => !isNullOrUndefined(id));

              // Use the helper function to determine which Roles to keep
              const {
                idsToBeRemoved,
                idsToBeSaved
              } = MemberRole.reconcileAssociationIds(
                currentRoleids,
                input.memberRoleIds ?? undefined
              );

              const removeErrors = [];
              // Delete any Role associations that were removed
              for (const id of idsToBeRemoved) {
                const role = await MemberRole.findById(reference, context, id as number);
                if (role) {
                  const wasRemoved = role.removeFromProjectMember(context, updatedId);
                  if (!wasRemoved) {
                    removeErrors.push(role.label);
                  }
                }
              }
              // If any failed to be removed, then add an error to the ProjectMember
              if (removeErrors.length > 0) {
                associationErrors.push(`unable to remove roles: ${removeErrors.join(', ')}`);
              }

              const addErrors = [];
              // Add any new Role associations
              for (const id of idsToBeSaved) {
                const role = await MemberRole.findById(reference, context, id as number);
                if (role) {
                  const wasAdded = role.addToProjectMember(context, updatedId);
                  if (!wasAdded) {
                    addErrors.push(role.label);
                  }
                }
              }
              // If any failed to be added, then add an error to the ProjectMember
              if (addErrors.length > 0) {
                associationErrors.push(`unable to assign roles: ${addErrors.join(', ')}`);
              }

              if (associationErrors.length > 0) {
                updated.addError('memberRoles', `Updated but ${associationErrors.join(', ')}`);
              }

              if (!updated.hasErrors()) {
                const plans = await Plan.findByProjectId(reference, context, member.projectId);
                for (const plan of plans) {
                  // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
                  await handleAsyncUpdates(reference, context, plan, project);
                }
              }

              // Reload since the roles may have changed
              return updated.hasErrors() ? updated : await ProjectMember.findById(reference, context, member.id);
            }
            // Otherwise there were errors so return the object with errors
            return updated;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // delete an existing ProjectMember
    removeProjectMember: async (_, { projectMemberId }, context) => {
      const reference = 'removeProjectMember resolver';
      try {
        if (isAuthorized(context.token)) {
          const member = await ProjectMember.findById(reference, context, projectMemberId);
          if (isNullOrUndefined(member)) {
            throw NotFoundError();
          }

          // Fetch the project and run a permission check
          const project = await Project.findById(reference, context, member.projectId);
          if (isNullOrUndefined(project)) {
            throw NotFoundError();
          }

          if (await hasPermissionOnProject(context, project)) {
            // Any related memberRoles will be automatically deleted within the DB
            const removed = await member.delete(context);
            if (removed && !removed.hasErrors()) {
              const plans = await Plan.findByProjectId(reference, context, member.projectId);
              for (const plan of plans) {
                // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
                await handleAsyncUpdates(reference, context, plan, project);
              }
            }
            return removed;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    //Add a Member to a Plan
    addPlanMember: async (_, { planId, projectMemberId, roleIds }, context: MyContext): Promise<PlanMember> => {
      const reference = 'addPlanMember resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (isNullOrUndefined(plan)) {
            throw NotFoundError();
          }

          const projectMember = await ProjectMember.findById(reference, context, projectMemberId);
          if (isNullOrUndefined(projectMember)) {
            throw NotFoundError();
          }

          let roles = roleIds ?? [];
          // If no roles were passed in then use whatever is currently set on the ProjectMember
          if (roles.length === 0) {
            // For now, planMember roles will match the projectMember roles
            const currentProjectRoles = await MemberRole.findByProjectMemberId(reference, context, projectMemberId);
            roles = currentProjectRoles
              .map((d) => d.id)
              .filter((id): id is number => !isNullOrUndefined(id));
          }

          const project = await Project.findById(reference, context, plan.projectId);
          if (isNullOrUndefined(project)) {
            throw NotFoundError();
          }
          if (await hasPermissionOnProject(context, project)) {
            const newPlanMember = new PlanMember({ planId, projectMemberId, memberRoleIds: roles });
            const created = await newPlanMember.create(context);

            if (isNullOrUndefined(created?.id)) {
              // A null was returned so add a generic error and return it
              if (isNullOrUndefined(newPlanMember.errors['general'])) {
                newPlanMember.addError('general', 'Unable to create PlanMember');
              }
              return newPlanMember;
            }

            // If any memberRole were specified and there were no errors creating the record
            if (Array.isArray(roles)) {
              if (created && !created.hasErrors()) {
                const addErrors = [];
                // Add any MemberRole associations
                for (const id of roles) {
                  const role = await MemberRole.findById(reference, context, id);
                  if (role) {
                    const wasAdded = await role.addToPlanMember(context, created.id);
                    if (!wasAdded) {
                      addErrors.push(role.label);
                    }
                  }
                }
                // If any failed to be added, then add an error to the PlanMember
                if (addErrors.length > 0) {
                  created.addError('memberRoles', `Created but unable to assign roles: ${addErrors.join(', ')}`);
                }
              }
            }

            // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
            // asynchronously so we don't block the Apollo thread
            if (created && !created.hasErrors()) {
              await handleAsyncUpdates(reference, context, plan, project);
            }

            return created;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing PlanMember
    updatePlanMember: async (_, { planId, planMemberId, memberRoleIds, isPrimaryContact }, context) => {
      const reference = 'updatePlanMember resolver';
      try {
        if (isAuthorized(context.token)) {
          const member = await PlanMember.findById(reference, context, planMemberId);
          if (isNullOrUndefined(member) || isNullOrUndefined(member.id)) {
            throw NotFoundError();
          }

          const plan = await Plan.findById(reference, context, member.planId);
          if (isNullOrUndefined(plan)) {
            throw NotFoundError();
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (isNullOrUndefined(project)) {
            throw NotFoundError();
          }
          const hasPermission = await hasPermissionOnProject(context, project);

          if (hasPermission) {
            // Fetch current roles
            const roles = await MemberRole.findByPlanMemberId(reference, context, planMemberId);
            const currentRoleIds = roles
              .map((d) => d.id)
              .filter((id): id is number => !isNullOrUndefined(id));

            // Update roles using the helper function
            const { updatedRoleIds, errors } = await updateMemberRoles(
              reference,
              context,
              member.id,
              currentRoleIds,
              memberRoleIds ?? []
            );

            if (errors.length > 0) {
              member.addError('memberRoles', `Updated but ${errors.join(', ')}`);
            }

            // Create a new instance of PlanMember and set the updated values
            const toUpdate = new PlanMember({
              id: planMemberId,
              planId: planId,
              projectMemberId: member.projectMemberId,
              isPrimaryContact: isPrimaryContact ?? undefined,
              memberRoleIds: updatedRoleIds ?? currentRoleIds,
            });

            //update the PlanMember with new instance
            const updatedPlan = await toUpdate.update(context);

            // Make updates for isPrimaryContact
            if (updatedPlan && !updatedPlan.hasErrors()) {
              if (isPrimaryContact === true) {
                // Get all members for the plan
                const allMembers = await PlanMember.findByPlanId(reference, context, planId);

                // Set isPrimaryContact to false for all other members
                for (const member of allMembers) {
                  if (isNullOrUndefined(member.id) || member.id === planMemberId) {
                    continue;
                  }
                  member.isPrimaryContact = false;
                  // Fetch current roles
                  const roles = await MemberRole.findByPlanMemberId(reference, context, member.id);
                  const roleIds = roles
                    .map((d) => d.id)
                    .filter((id): id is number => !isNullOrUndefined(id));
                  member.memberRoleIds = roleIds;
                  await member.update(context);
                }
              }

              const plan = await Plan.findById(reference, context, planId);
              if (member && !member.hasErrors() && !isNullOrUndefined(plan)) {
                // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
                await handleAsyncUpdates(reference, context, plan, project);
              }
            }

            return member.hasErrors() ? member : await PlanMember.findById(reference, context, member.id);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // delete an existing PlanMember
    removePlanMember: async (_, { planMemberId }, context) => {
      const reference = 'removePlanMember resolver';
      try {
        if (isAuthorized(context.token)) {
          const member = await PlanMember.findById(reference, context, planMemberId);
          if (isNullOrUndefined(member)) {
            throw NotFoundError();
          }

          // Fetch the plan and run a permission check
          const plan = await Plan.findById(reference, context, member.planId);
          if (isNullOrUndefined(plan)) {
            throw NotFoundError();
          }

          const project = await Project.findById(reference, context, plan.projectId);
          if (isNullOrUndefined(project)) {
            throw NotFoundError();
          }
          if (await hasPermissionOnProject(context, project)) {
            // Any related MemberRoles will be automatically deleted within the DB
            const removed = await member.delete(context);

            if (removed && !removed.hasErrors()) {
              const plan = await Plan.findById(reference, context, member.planId);
              if (plan) {
                // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
                await handleAsyncUpdates(reference, context, plan, project);
              }
            }
            return removed;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  // NOTE: `parent` below is typed to the GraphQL-facing shape (no raw FK fields like
  // projectId/affiliationId/planId), but at runtime it is actually the model instance
  // returned by the parent resolver, so it's cast back via `as unknown as X`.
  ProjectMember: {
    project: async (parent, _, context: MyContext) => {
      const model = parent as unknown as ProjectMember;
      if (model?.projectId) {
        return await Project.findById('Chained ProjectMember.project', context, model.projectId);
      }
      return null;
    },
    affiliation: async (parent, _, context: MyContext) => {
      const model = parent as unknown as ProjectMember;
      if (model?.affiliationId) {
        const affiliation = await Affiliation.findByURI('Chained ProjectMember.affiliation', context, model.affiliationId);
        return affiliation as unknown as AffiliationGQL;
      }
      return null;
    },
    memberRoles: async (parent, _, context: MyContext): Promise<MemberRole[]> => {
      const model = parent as unknown as ProjectMember;
      if (model?.id) {
        return await MemberRole.findByProjectMemberId(
          'Chained ProjectMember.memberRoles',
          context,
          model.id
        );
      }
      return [];
    },
    created: (parent) => {
      const model = parent as unknown as ProjectMember;
      return normaliseDateTime(model.created);
    },
    modified: (parent) => {
      const model = parent as unknown as ProjectMember;
      return normaliseDateTime(model.modified);
    }
  },

  PlanMember: {
    plan: async (parent, _, context: MyContext) => {
      const model = parent as unknown as PlanMember;
      if (model?.planId) {
        return await Plan.findById('Chained PlanMember.plan', context, model.planId);
      }
      return null;
    },
    projectMember: async (parent, _, context: MyContext) => {
      const model = parent as unknown as PlanMember;
      if (model?.projectMemberId) {
        return await ProjectMember.findById(
          'Chained PlanMember.projectMember',
          context, model.projectMemberId
        );
      }
      return null;
    },
    memberRoles: async (parent, _, context: MyContext): Promise<MemberRole[]> => {
      const model = parent as unknown as PlanMember;
      if (model?.id) {
        return await MemberRole.findByPlanMemberId(
          'Chained ProjectMember.memberRoles',
          context,
          model.id
        );
      }
      return [];
    },
    created: (parent) => {
      const model = parent as unknown as PlanMember;
      return normaliseDateTime(model.created);
    },
    modified: (parent) => {
      const model = parent as unknown as PlanMember;
      return normaliseDateTime(model.modified);
    }
  },
};
