import { prepareObjectForLogs } from '../logger';
import { ExternalProject, ProjectSearchResults, Resolvers } from "../types";
import { Project, ProjectSearchResult } from "../models/Project";
import { ProjectCollaborator } from '../models/Collaborator';
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { ProjectFunding } from '../models/Funding';
import { ProjectMember } from '../models/Member';
import { hasPermissionOnProject } from '../services/projectService';
import { Affiliation } from '../models/Affiliation';
import { ResearchDomain } from '../models/ResearchDomain';
import { ProjectOutput } from '../models/Output';
import { MemberRole } from '../models/MemberRole';
import { GraphQLError } from 'graphql';
import { Plan, PlanSearchResult } from '../models/Plan';
import { addVersion } from '../models/PlanVersion';
import { isNullOrUndefined, normaliseDate } from '../utils/helpers';
import { parseMember } from '../services/commonStandardService';
import { PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from '../types/general';
import {formatISO9075} from "date-fns";

export const resolvers: Resolvers = {
  Query: {
    // return all of the projects that the current user owns or is a collaborator on
    myProjects: async (_, { term, paginationOptions }, context: MyContext): Promise<ProjectSearchResults> => {
      const reference = 'myProjects resolver';
      try {
        if (isAuthorized(context.token)) {
          const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
                      ? paginationOptions as PaginationOptionsForOffsets
                      : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

          return await ProjectSearchResult.search(reference, context, term, context.token?.id, opts);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
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

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    searchExternalProjects: async (_, { affiliationId , awardId, awardName, awardYear, piNames }, context: MyContext): Promise<ExternalProject[]> => {
      const reference = 'external project search resolver';

      try {
        if (isAuthorized(context.token)) {
          const dmphubAPI = context.dataSources.dmphubAPIDataSource;
          const affiliation = await Affiliation.findById(reference, context, affiliationId);
          const dmps = await dmphubAPI.getAwards(
            context,
            affiliation.apiTarget,
            awardId,
            awardName,
            awardYear,
            piNames,
          );
          return dmps.map((dmpHubAward) => {
            const members = [
              parseMember(dmpHubAward.contact),
              ...dmpHubAward.contributor.map((c) => parseMember(c)),
            ].filter((c) => c !== null);

            return {
              title: dmpHubAward.project.title,
              abstractText: dmpHubAward.project.description,
              startDate: normaliseDate(dmpHubAward.project.start),
              endDate: normaliseDate(dmpHubAward.project.end),
              fundings: dmpHubAward.project.funding.map((fund) => ({
                funderProjectNumber: fund.dmproadmap_project_number,
                grantId: fund.grant_id.identifier,
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
          try {
            const newProject = new Project({ title, isTestProject });
            const created = await newProject.create(context);

            // Automatically add this user as a projectCollaborator with acccessLevel = OWN when project created
            const collaborator = new ProjectCollaborator({
              projectId: created.id,
              email: context.token?.email,
              userId: context.token?.id,
              accessLevel: 'OWN',
            });
            await collaborator.create(context);

            if (created?.id) {
              return created;
            }

            // A null was returned so add a generic error and return it
            if (!newProject.errors['general']) {
              newProject.addError('general', 'Unable to create Project');
            }

            // Return new project
            return newProject;
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

    // Import project from an external data source
    projectImport: async (_, {input}, context) => {
      const reference = 'updateProject resolver';
      try {
        if (isAuthorized(context.token)) {
          try {
            const projectId = input.project.id;
            const existingProject = await Project.findById(reference, context, projectId);
            if (!existingProject) {
              throw NotFoundError();
            }

            if (!hasPermissionOnProject(context, existingProject)) {
              throw ForbiddenError();
            }

            // Update project
            const toUpdateProject = new Project(input.project);
            const updatedProject = await toUpdateProject.update(context);

            // Add project funding and project members
            if (updatedProject && !updatedProject.hasErrors()) {
              // Update project funding
              const addFundingErrors = [];
              for (const fund of input.funding) {
                const newFunding = new ProjectFunding(fund);
                const fundingAdded = await newFunding.create(context, projectId);
                if(!fundingAdded){
                  addFundingErrors.push(`Funding(affiliationId=${newFunding.affiliationId})`);
                }
              }
              if(addFundingErrors.length > 0){
                const msg = `Unable to add fundings to project: ${addFundingErrors.join(', ')}`;
                context.logger.error(prepareObjectForLogs({ projectId }), msg);
                updatedProject.addError('fundings', msg)
              }

              // Update project members
              const addMemberErrors = [];
              const addMemberRoleErrors = [];
              for (const contrib of input.members) {
                // Add project member
                const newMember = new ProjectMember(contrib);
                context.logger.debug(`${reference}: add project member`);
                const memberAdded = await newMember.create(context, projectId);
                if(!memberAdded){
                  addMemberErrors.push(`Member(affiliationId=${newMember.affiliationId}, givenName=${newMember.givenName}, surName=${newMember.surName}, orcid=${newMember.orcid}, email=${newMember.email})`);
                } else {
                  // Add member role
                  context.logger.debug(`${reference}: add member role`);
                  const role = await MemberRole.defaultRole(context, reference);
                  if(!role){
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

              if(addMemberErrors.length > 0){
                const msg = `Unable to add members to project: ${addMemberErrors.join(', ')}`;
                context.logger.error(prepareObjectForLogs({ projectId }), msg);
                updatedProject.addError('members', msg)
              }
              if(addMemberRoleErrors.length > 0){
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
    members: async (parent: Project, _, context: MyContext): Promise<ProjectMember[]> => {
      return await ProjectMember.findByProjectId(
        'Chained Project.members',
        context,
        parent.id
      );
    },
    fundings: async (parent: Project, _, context: MyContext): Promise<ProjectFunding[]> => {
      return await ProjectFunding.findByProjectId(
        'Chained Project.fundings',
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
    created: (parent: Project) => {
      return formatISO9075(new Date(parent.created));
    },
    modified: (parent: Project) => {
      return formatISO9075(new Date(parent.modified));
    }
  },
};
