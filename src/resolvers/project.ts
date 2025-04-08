import { formatLogMessage } from '../logger';
import { ExternalProject, Resolvers } from "../types";
import { Project, ProjectSearchResult } from "../models/Project";
import { MyContext } from '../context';
import { isAuthorized } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';
import { ProjectFunder } from '../models/Funder';
import { ProjectContributor } from '../models/Contributor';
import { hasPermissionOnProject } from '../services/projectService';
import { Affiliation } from '../models/Affiliation';
import { ResearchDomain } from '../models/ResearchDomain';
import { ProjectOutput } from '../models/Output';
import { ContributorRole } from '../models/ContributorRole';
import { GraphQLError } from 'graphql';
import { Plan, PlanSearchResult } from '../models/Plan';
import { addVersion } from '../models/PlanVersion';
import { normaliseDate } from '../utils/helpers';
import { parseContributor } from '../services/commonStandardService';

export const resolvers: Resolvers = {
  Query: {
    // return all of the projects that the current user owns or is a collaborator on
    myProjects: async (_, __, context: MyContext): Promise<ProjectSearchResult[]> => {
      const reference = 'myProjects resolver';
      try {
        if (isAuthorized(context.token)) {
          return await ProjectSearchResult.findByUserId(reference, context, context.token?.id);
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
            const contributors = [
              parseContributor(dmpHubAward.contact),
              ...dmpHubAward.contributor.map((c) => parseContributor(c)),
            ].filter((c) => c !== null);

            return {
              title: dmpHubAward.project.title,
              abstractText: dmpHubAward.project.description,
              startDate: normaliseDate(dmpHubAward.project.start),
              endDate: normaliseDate(dmpHubAward.project.end),
              funders: dmpHubAward.project.funding.map((fund) => ({
                funderProjectNumber: fund.dmproadmap_project_number,
                grantId: fund.grant_id.identifier,
                funderOpportunityNumber: fund.dmproadmap_opportunity_number,
              })),
              contributors: contributors,
            };
          });
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

            // Add project funding and project contributors
            if (updatedProject && !updatedProject.hasErrors()) {
              // Update project funding
              const addFunderErrors = [];
              for (const fund of input.funding) {
                const newFunder = new ProjectFunder(fund);
                const funderAdded = await newFunder.create(context, projectId);
                if(!funderAdded){
                  addFunderErrors.push(`Funder(affiliationId=${newFunder.affiliationId})`);
                }
              }
              if(addFunderErrors.length > 0){
                const msg = `Unable to add funders to project: ${addFunderErrors.join(', ')}`;
                formatLogMessage(context).error(msg);
                updatedProject.addError('funders', msg)
              }

              // Update project contributors
              const addContributorErrors = [];
              const addContributorRoleErrors = [];
              for (const contrib of input.contributors) {
                // Add project contributor
                const newContributor = new ProjectContributor(contrib);
                formatLogMessage(context).debug(`${reference}: add project contributor`);
                const contributorAdded = await newContributor.create(context, projectId);
                if(!contributorAdded){
                  addContributorErrors.push(`Contributor(affiliationId=${newContributor.affiliationId}, givenName=${newContributor.givenName}, surName=${newContributor.surName}, orcid=${newContributor.orcid}, email=${newContributor.email})`);
                } else {
                  // Add contributor role
                  formatLogMessage(context).debug(`${reference}: add contributor role`);
                  const role = await ContributorRole.defaultRole(context, reference);
                  if(!role){
                    formatLogMessage(context).error(`${reference}: could not find default role`);
                  } else {
                    formatLogMessage(context).debug(`${reference}: add ${role.label} to contributor ${contributorAdded.id}`);
                    const wasAdded = await role.addToProjectContributor(context, contributorAdded.id);
                    if (!wasAdded) {
                      addContributorRoleErrors.push(`ContributorRole(contributorId=${contributorAdded.id}, role=${role.label})`);
                    }
                  }
                }
              }

              if(addContributorErrors.length > 0){
                const msg = `Unable to add contributors to project: ${addContributorErrors.join(', ')}`;
                formatLogMessage(context).error(msg);
                updatedProject.addError('contributors', msg)
              }
              if(addContributorRoleErrors.length > 0){
                const msg = `Unable to add default contributor roles: ${addContributorRoleErrors.join(', ')}`
                formatLogMessage(context).error(msg);
                updatedProject.addError('contributorRoles', msg)
              }
            }

            return updatedProject;
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
