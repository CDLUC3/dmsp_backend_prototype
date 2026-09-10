import { prepareObjectForLogs } from '../logger.js';
import { ExternalProject, ProjectSearchResults, Resolvers } from "../types.js";
import { Project, ProjectSearchResult } from "../models/Project.js";
import {
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel
} from '../models/Collaborator.js';
import { MyContext } from '../context.js';
import { authenticatedResolver, isAdmin, isAuthorized, isSuperAdmin } from '../services/authService.js';
import {
  AuthenticationError,
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from '../utils/graphQLErrors.js';
import { ProjectFunding, ProjectFundingStatus } from '../models/Funding.js';
import { ProjectMember } from '../models/Member.js';
import { User, UserRole } from "../models/User.js";
import {
  ensureDefaultProjectContact,
  hasPermissionOnProject,
  isProjectReadOnlyForCurrentUser,
  setCurrentUserAsProjectOwner
} from '../services/projectService.js';
import { Affiliation } from '../models/Affiliation.js';
import { ResearchDomain } from '../models/ResearchDomain.js';
import { MemberRole } from '../models/MemberRole.js';
import { GraphQLError } from 'graphql';
import { Plan, PlanSearchResult } from '../models/Plan.js';
import {
  isNullOrUndefined,
  normaliseDate,
  normaliseDateTime
} from '../utils/helpers.js';
import { validateEmail } from '../utils/helpers.js';
import {
  PaginationOptionsForCursors,
  PaginationOptionsForOffsets,
  PaginationType,
} from '../types/general.js';
import { handleAsyncDeletes, handleAsyncUpdates } from "../services/planService.js";

export const resolvers: Resolvers = {
  Query: {
    // return all projects that the current user owns or is a collaborator on
    myProjects: async (
      _,
      { term, paginationOptions, filterOptions },
      context: MyContext
    ): Promise<ProjectSearchResults> => {
      const reference = 'myProjects resolver';
      try {
        if (isAuthorized(context.token)) {
          const pagOpts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
            ? paginationOptions as PaginationOptionsForOffsets
            : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

          return await ProjectSearchResult.search(
            reference,
            context,
            term ?? '',
            context.token?.id,
            context.token?.affiliationId,
            filterOptions ?? undefined,
            pagOpts
          );
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Return all projects based on the user's role (Admin only!)
    allProjects: async (
      _,
      { term, paginationOptions, filterOptions },
      context: MyContext
    ): Promise<ProjectSearchResults> => {
      const reference = 'allProjects resolver';
      try {
        if (isAdmin(context.token)) {
          const pagOpts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
            ? paginationOptions as PaginationOptionsForOffsets
            : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

          // Falsy sentinel (0) rather than null: the search() signature requires a plain
          // number, and the query only checks `if (userId)`, so 0 has the same "no filter" effect.
          const userId = isAdmin(context.token) ? 0 : (context.token?.id ?? 0);
          const affiliationId = isSuperAdmin(context.token) ? null : context.token?.affiliationId;

          return await ProjectSearchResult.search(
            reference,
            context,
            term ?? '',
            userId,
            affiliationId,
            filterOptions ?? undefined,
            pagOpts
          );
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Return all projects for a specified user (Admin only!) with pagination and optional search term filtering
    userProjects: authenticatedResolver(
      'userProjects resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { userId, term, paginationOptions, filterOptions },
        context: MyContext
      ): Promise<ProjectSearchResults> => {
        const reference = 'userProjects resolver';
        try {
          const superAdmin = isSuperAdmin(context.token);

          if (!superAdmin) {
            const targetUser = await User.findById(reference, context, userId);
            if (!targetUser) throw NotFoundError(`User with ID ${userId} not found`);

            if (!(isAdmin(context.token) && context.token.affiliationId === targetUser.affiliationId)) {
              throw ForbiddenError();
            }
          }

          const pagOpts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
            ? paginationOptions as PaginationOptionsForOffsets
            : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

          return await ProjectSearchResult.search(
            reference,
            context,
            term ?? '',
            userId,
            context.token?.affiliationId,
            filterOptions ?? undefined,
            pagOpts
          );
        } catch (err) {
          if (err instanceof GraphQLError) throw err;
          context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
          throw InternalServerError();
        }
      },
    ),

    // Fetch a single project
    project: async (_, { projectId }, context: MyContext): Promise<Project> => {
      const reference = 'project resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);
          if (isNullOrUndefined(project)) {
            throw NotFoundError();
          }

          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
            const readOnly = await isProjectReadOnlyForCurrentUser(reference, context, project);
            return Object.assign(project, { readOnly }) as Project & { readOnly: boolean };
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    searchExternalProjects: async (_, { input }, context: MyContext): Promise<ExternalProject[]> => {
      const reference = 'external project search resolver';
      const { affiliationId, awardId, awardName, awardYear, piNames } = input;

      try {
        if (isAuthorized(context.token)) {
          const dmphubAPI = context.dataSources.dmphubAPIDataSource;
          const affiliation = await Affiliation.findByURI(reference, context, affiliationId);
          if (!affiliation?.apiTarget) {
            throw NotFoundError(`Affiliation with URI ${affiliationId} not found`);
          }
          const dmps = await dmphubAPI.getAwards(
            context,
            affiliation.apiTarget,
            awardId,
            awardName,
            awardYear,
            piNames?.filter((name): name is string => !!name) ?? null,
          );

          return dmps.map((dmpHubAward) => {
            const members = Array.isArray(dmpHubAward.contributor)
              ? dmpHubAward.contributor.map(contrib => {
                const parts = contrib.name.split(',');
                const potentialEmail = parts[0]?.trim();
                const isValidEmail = validateEmail(potentialEmail ?? '');

                const email = isValidEmail ? potentialEmail : undefined;
                const nameParts = isValidEmail ? parts.slice(1) : parts;

                const givenName = nameParts.slice(1).join(',').trim();
                const surName = nameParts[0]?.trim();

                return {
                  email: email?.trim(),
                  givenName,
                  surName,
                  role: contrib.role || []
                };
              })
              : [];

            return {
              title: dmpHubAward.project.title,
              abstractText: dmpHubAward.project.description,
              startDate: normaliseDate(dmpHubAward.project.start),
              awardYear: dmpHubAward.project.start ? dmpHubAward.project.start.slice(0, 4) : null,
              endDate: normaliseDate(dmpHubAward.project.end),
              fundings: (dmpHubAward.project.funding ?? []).map((fund) => ({
                funderProjectNumber: fund.dmproadmap_project_number,
                grantId: fund.grant_id?.identifier,
                funderOpportunityNumber: fund.dmproadmap_opportunity_number,
              })),
              members: members,
            };
          });
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
    // add a new project
    addProject: async (_, { title, isTestProject }, context: MyContext) => {
      const reference = 'addProject resolver';
      try {
        if (isAuthorized(context.token)) {
          const newProject = new Project({ title, isTestProject: isTestProject ?? undefined });
          const created = await newProject.create(context);

          if (!isNullOrUndefined(created)) {
            if (!created.hasErrors() && !isNullOrUndefined(created.id)) {
              // Set the current user as an owner on the project
              const ownerWasSet = await setCurrentUserAsProjectOwner(context, created.id);
              // Set the current user as the default primary contact
              const contactWasSet = await ensureDefaultProjectContact(context, created);

              if (!ownerWasSet) {
                created.addError('general', 'Unable to set the default owner of the project');
              }
              if (!contactWasSet) {
                created.addError('general', 'Unable to set the default primary contact');
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

    // update a project
    updateProject: async (_, { input }, context) => {
      const reference = 'updateProject resolver';
      try {
        if (isAuthorized(context.token)) {
          if (isNullOrUndefined(input)) {
            throw NotFoundError();
          }

          const project = await Project.findById(reference, context, input.id);
          if (isNullOrUndefined(project) || isNullOrUndefined(project.id)) {
            throw NotFoundError();
          }

          if (!(await hasPermissionOnProject(context, project))) {
            throw ForbiddenError();
          }

          const toUpdate = new Project({
            id: input.id,
            title: input.title,
            abstractText: input.abstractText ?? undefined,
            startDate: input.startDate ?? undefined,
            endDate: input.endDate ?? undefined,
            researchDomainId: input.researchDomainId ?? undefined,
            isTestProject: input.isTestProject ?? undefined,
          });
          const updated = await toUpdate.update(context);
          if (updated && !updated.hasErrors()) {
            // Update each plan's version snapshot if the project was updated
            const plans = await Plan.findByProjectId(reference, context, project.id);
            for (const plan of plans) {
              // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
              await handleAsyncUpdates(reference, context, plan, updated);
            }
          }

          return updated;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // archive a project
    archiveProject: async (_, { projectId }, context) => {
      const reference = 'archiveProject resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);
          if (!project || isNullOrUndefined(project.id)) {
            throw NotFoundError();
          }

          // Only allow the owner of the project to delete it
          if (!(await hasPermissionOnProject(context, project))) {
            throw ForbiddenError();
          }

          // Delete/Tombstone each plan associated with the project
          const plans = await Plan.findByProjectId(reference, context, project.id);
          for (const plan of plans) {
            const deleted = await plan.delete(context);

            if (deleted && !deleted.hasErrors()) {
              // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
              await handleAsyncDeletes(reference, context, deleted);
            }
          }

          return await project.delete(context);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Import project from an external data source
    projectImport: async (_, { input }, context) => {
      const reference = 'updateProject resolver';
      try {
        if (isAuthorized(context.token)) {
          try {
            if (isNullOrUndefined(input)) {
              throw NotFoundError();
            }
            const projectId = input.project.id;
            const existingProject = await Project.findById(reference, context, projectId);
            if (!existingProject) {
              throw NotFoundError();
            }

            if (!hasPermissionOnProject(context, existingProject)) {
              throw ForbiddenError();
            }

            // Update project
            const toUpdateProject = new Project({
              id: input.project.id,
              title: input.project.title,
              abstractText: input.project.abstractText ?? undefined,
              startDate: input.project.startDate ?? undefined,
              endDate: input.project.endDate ?? undefined,
              researchDomainId: input.project.researchDomainId ?? undefined,
              isTestProject: input.project.isTestProject ?? undefined,
            });
            const updatedProject = await toUpdateProject.update(context);

            // Add project funding and project members
            if (updatedProject && !updatedProject.hasErrors()) {
              // Update project funding
              const addFundingErrors = [];
              for (const fund of input.funding ?? []) {
                const newFunding = new ProjectFunding({
                  projectId,
                  affiliationId: fund.affiliationId,
                  status: (fund.status ?? undefined) as ProjectFundingStatus | undefined,
                  funderProjectNumber: fund.funderProjectNumber ?? undefined,
                  grantId: fund.grantId ?? undefined,
                  funderOpportunityNumber: fund.funderOpportunityNumber ?? undefined,
                });

                // Check if a funding record already exists for this affiliation on the project. If so,
                // update it instead of creating a new one to avoid duplicates.
                const existingFunding = await ProjectFunding.findByProjectAndAffiliation(
                  reference,
                  context,
                  projectId,
                  newFunding.affiliationId
                );

                if (existingFunding) {
                  // Merge the new data into the existing record and update
                  existingFunding.funderProjectNumber = newFunding.funderProjectNumber;
                  existingFunding.grantId = newFunding.grantId;
                  existingFunding.funderOpportunityNumber = newFunding.funderOpportunityNumber;
                  const fundingResult = await existingFunding.update(context);
                  if (!fundingResult || fundingResult.hasErrors()) {
                    addFundingErrors.push(`Funding(affiliationId=${newFunding.affiliationId})`);
                  }
                } else {
                  const fundingResult = await newFunding.create(context, projectId);
                  if (!fundingResult || fundingResult.hasErrors()) {
                    addFundingErrors.push(`Funding(affiliationId=${newFunding.affiliationId})`);
                  }
                }
              }
              if (addFundingErrors.length > 0) {
                const msg = `Unable to add fundings to project: ${addFundingErrors.join(', ')}`;
                context.logger.error(prepareObjectForLogs({ projectId }), msg);
                updatedProject.addError('fundings', msg)
              }

              // Update project members
              const addMemberErrors = [];
              const addMemberRoleErrors = [];
              for (const contrib of input.members ?? []) {
                // Add project member
                const newMember = new ProjectMember({
                  projectId,
                  affiliationId: contrib.affiliationId ?? undefined,
                  givenName: contrib.givenName ?? undefined,
                  surName: contrib.surName ?? undefined,
                  orcid: contrib.orcid ?? undefined,
                  email: contrib.email ?? undefined,
                });
                context.logger.debug(`${reference}: add project member`);
                const memberAdded = await newMember.create(context, projectId);
                if (!memberAdded || isNullOrUndefined(memberAdded.id)) {
                  addMemberErrors.push(`Member(affiliationId=${newMember.affiliationId}, givenName=${newMember.givenName}, surName=${newMember.surName}, orcid=${newMember.orcid}, email=${newMember.email})`);
                } else {
                  // Add member role
                  context.logger.debug(`${reference}: add member role`);
                  const role = await MemberRole.defaultRole(context, reference);
                  if (!role) {
                    context.logger.error(`${reference}: could not find default role`);
                  } else {
                    context.logger.debug(`${reference}: add ${role.label} to member ${memberAdded.id}`);
                    const wasAdded = await role.addToProjectMember(context, memberAdded.id);
                    if (!wasAdded) {
                      addMemberRoleErrors.push(`MemberRole(memberId=${memberAdded.id}, role=${role.label})`);
                    }
                  }
                }
              }

              if (addMemberErrors.length > 0) {
                const msg = `Unable to add members to project: ${addMemberErrors.join(', ')}`;
                context.logger.error(prepareObjectForLogs({ projectId }), msg);
                updatedProject.addError('members', msg)
              }
              if (addMemberRoleErrors.length > 0) {
                const msg = `Unable to add default member roles: ${addMemberRoleErrors.join(', ')}`
                context.logger.error(prepareObjectForLogs({ projectId }), msg);
                updatedProject.addError('memberRoles', msg)
              }
            }

            return updatedProject;
          } catch (err) {
            context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
            throw InternalServerError();
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
  // researchDomainId), but at runtime it is actually the model instance returned by the
  // parent resolver, so it's cast back via `as unknown as X`.
  Project: {
    researchDomain: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Project;
      if (model.researchDomainId) {
        return await ResearchDomain.findById(
          'Chained Project.researchDomain',
          context,
          model.researchDomainId
        );
      }
      return null;
    },
    collaborators: async (parent, _, context: MyContext): Promise<ProjectCollaborator[]> => {
      const model = parent as unknown as Project;
      if (!model?.id) return [];
      return await ProjectCollaborator.findByProjectId(
        'Chained Project.collaborators',
        context,
        model.id
      );
    },
    members: async (parent, _, context: MyContext): Promise<ProjectMember[]> => {
      const model = parent as unknown as Project;
      if (!model?.id) return [];
      return await ProjectMember.findByProjectId(
        'Chained Project.members',
        context,
        model.id
      );
    },
    fundings: async (parent, _, context: MyContext): Promise<ProjectFunding[]> => {
      const model = parent as unknown as Project;
      if (!model?.id) return [];
      return await ProjectFunding.findByProjectId(
        'Chained Project.fundings',
        context,
        model.id
      );
    },
    plans: async (parent, _, context: MyContext): Promise<PlanSearchResult[]> => {
      const model = parent as unknown as Project;
      if (!model?.id) return [];
      return await PlanSearchResult.findByProjectId(
        'Chained Project.plans',
        context,
        model.id
      );
    },
    created: (parent) => {
      const model = parent as unknown as Project;
      return normaliseDateTime(model.created);
    },
    modified: (parent) => {
      const model = parent as unknown as Project;
      return normaliseDateTime(model.modified);
    }
  },
  ProjectSearchResult: {
    plans: async (parent, _, context: MyContext): Promise<PlanSearchResult[]> => {
      const model = parent as unknown as ProjectSearchResult;
      if (!model?.id) return [];
      return await PlanSearchResult.findByProjectId(
        'Chained Project.plans',
        context,
        model.id
      );
    },
  }
};
