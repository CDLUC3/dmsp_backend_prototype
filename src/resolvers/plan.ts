import { GraphQLError } from "graphql";
import { MyContext } from "../context";
import { Plan, PlanSearchResult, PlanSectionProgress, PlanStatus, PlanVisibility } from "../models/Plan";
import { formatLogMessage } from "../logger";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { Project } from "../models/Project";
import { isAuthorized } from "../services/authService";
import { hasPermissionOnProject } from "../services/projectService";
import { PlanContributor } from "../models/Contributor";
import { PlanFunder } from "../models/Funder";
import { Resolvers } from "../types";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { versionDMP } from "../services/planService";
import { valueIsEmpty } from "../utils/helpers";
import { Answer } from "../models/Answer";

export const resolvers: Resolvers = {
  Query: {
    // return all of the projects that the current user owns or is a collaborator on
    plans: async (_, { projectId }, context: MyContext): Promise<PlanSearchResult[]> => {
      const reference = 'plans resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);

          if (!project) {
            throw NotFoundError(`Project with ID ${projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project)) {
            return await PlanSearchResult.findByProjectId(reference, context, projectId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Find the plan by its id
    plan: async (_, { planId }, context: MyContext): Promise<Plan> => {
      const reference = 'plan resolver';
      try {
        const plan = await Plan.findById(reference, context, planId);
        if (!plan) {
          throw NotFoundError(`Plan with ID ${planId} not found`);
        }

        const project = await Project.findById(reference, context, plan.projectId);
        if (project && hasPermissionOnProject(context, project)) {
          return plan;
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
    // Create a new plan
    addPlan: async (_, { projectId, versionedTemplateId }, context: MyContext): Promise<Plan> => {
      const reference = 'add plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);

          if (!project) {
            throw NotFoundError(`Project with ID ${projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project)) {
            const plan = new Plan({ projectId, versionedTemplateId });

            // Create the initial version of the DMP
            const version = await versionDMP(context, plan, reference);
            if (version && !version.hasErrors()) {
              const newPlan = await version.create(context);
              if (newPlan) {
                return new Plan(newPlan);
              }
            }

            if (!plan.hasErrors()) {
              plan.addError('general', 'Unable to create a new plan. Failed to create a version snapshot');
            }
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Delete a plan
    archivePlan: async (_, { dmpId }, context: MyContext): Promise<Plan> => {
      const reference = 'archive plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findByDMPId(reference, context, dmpId);
          if (!plan) {
            throw NotFoundError(`Plan with DMP ID ${dmpId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!valueIsEmpty(plan.registered)) {
            plan.addError('general', 'Plan is already published and cannot be archived');
          }
          if (!plan.hasErrors() && await hasPermissionOnProject(context, project)) {
            plan.status = PlanStatus.ARCHIVED;

            // Create the tombstoned version of the DMP
            const newVersion = await versionDMP(context, plan, reference);
            if (newVersion) {
              // If the versioning was successful, then delete the current plan
              const deletedPlan = await plan.delete(context);
              if (deletedPlan) {
                return deletedPlan;
              }
            }

            if (!plan.hasErrors()) {
              plan.addError('general', 'Unable to archive plan. Failed to create a version snapshot');
            }
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Upload a PDF version of a plan
    uploadPlan: async (_, { projectId, fileName, fileContent }, context: MyContext): Promise<Plan> => {
      const reference = 'upload plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const project = await Project.findById(reference, context, projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project)) {
            const plan = new Plan({ projectId, fileName, fileContent });

            // TODO: Figure out what would be passed in from the client and how we'd get the actual
            //       file content and push it into an S3 bucket
            plan.addError('general', 'Uploads have not yet been implemented');
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Publish/register the plan with the DOI registrar (e.g. EZID/DataCite)
    publishPlan: async (_, { dmpId, visibility }, context: MyContext): Promise<Plan> => {
      const reference = 'publish plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findByDMPId(reference, context, dmpId);
          if (!plan) {
            throw NotFoundError(`Plan with DMP ID ${dmpId} not found`);
          }
          if (!valueIsEmpty(plan.registered)) {
            plan.addError('general', 'Plan is already published');
          }

          const project = await Project.findById(reference, context, plan.projectId);
          if (!plan.hasErrors() && await hasPermissionOnProject(context, project)) {
            if (project.isTestProject) {
              plan.addError('general', 'Test projects cannot be published');
            } else if (plan.registered) {
              plan.addError('general', 'Plan is already published');
            }

            if (!plan.hasErrors()) {
              plan.status = PlanStatus.PUBLISHED;
              plan.registered = new Date().toISOString();
              plan.registeredById = context.token.id;
              plan.visibility = visibility as PlanVisibility;

              // Create a version snapshot
              const newVersion = await versionDMP(context, plan, reference);
              if (newVersion) {
                // if the versioning was successful, then update the plan
                const publishedPlan = await plan.update(context);

                if (publishedPlan) {
                  return publishedPlan;
                }
              }
            }

            if (!plan.hasErrors()) {
              plan.addError('general', 'Unable to publish plan. Failed to create a version snapshot');
            }
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Mark the plan as complete
    markPlanAsComplete: async (_, { dmpId }, context: MyContext): Promise<Plan> => {
      const reference = 'mark plan complete resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findByDMPId(reference, context, dmpId);
          if (!plan) {
            throw NotFoundError(`Plan with DMP ID ${dmpId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (await hasPermissionOnProject(context, project)) {
            if (plan.registered) {
              plan.addError('general', 'Plan is already published');
            } else {
              plan.status = PlanStatus.COMPLETE;

              // First create a version snapshot (before making changes)
              const newVersion = await versionDMP(context, plan, reference);
              if (newVersion) {
                const updatedPlan = await plan.update(context);

                if (updatedPlan) {
                  return updatedPlan;
                }
              }
            }

            if (!plan.hasErrors()) {
              plan.addError('general', 'Unable to mark plan as complete. Failed to create a version snapshot');
            }
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Mark the plan as a draft
    markPlanAsDraft: async (_, { dmpId }, context: MyContext): Promise<Plan> => {
      const reference = 'mark plan draft resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findByDMPId(reference, context, dmpId);
          if (!plan) {
            throw NotFoundError(`Plan with DMP ID ${dmpId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (await hasPermissionOnProject(context, project)) {
            if (plan.registered) {
              plan.addError('general', 'Plan is already published');
            } else {
              plan.status = PlanStatus.DRAFT;

              // First create a version snapshot (before making changes)
              const newVersion = await versionDMP(context, plan, reference);
              if (newVersion) {
                const updatedPlan = await plan.update(context);
                if (updatedPlan) {
                  return updatedPlan;
                }
              }
            }

            if (!plan.hasErrors()) {
              plan.addError('general', 'Unable to mark plan as draft. Failed to create a version snapshot');
            }
            return plan;
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

  Plan: {
    // The project the plan is associated with
    project: async (parent: Plan, _, context: MyContext): Promise<Project> => {
      if (parent?.projectId) {
        return await Project.findById('project resolver', context, parent.projectId);
      }
      return null;
    },
    // The template the plan is based on
    versionedTemplate: async (parent: Plan, _, context: MyContext): Promise<VersionedTemplate> => {
      if (parent?.versionedTemplateId) {
        return await VersionedTemplate.findById('versioned template resolver', context, parent.versionedTemplateId);
      }
      return null;
    },
    // The contributors to the plan
    contributors: async (parent: Plan, _, context: MyContext): Promise<PlanContributor[]> => {
      if (parent?.id) {
        return await PlanContributor.findByPlanId('plan contributors resolver', context, parent.id);
      }
      return [];
    },
    // The funding sources for the plan
    funders: async (parent: Plan, _, context: MyContext): Promise<PlanFunder[]> => {
      if (parent?.id) {
        return await PlanFunder.findByPlanId('plan funders resolver', context, parent.id);
      }
      return [];
    },
    answers: async (parent: Plan, _, context: MyContext): Promise<Answer[]> => {
      if (parent?.id) {
        return await Answer.findByPlanId('plan answers resolver', context, parent.id);
      }
      return [];
    },
    sections: async (parent: Plan, _, context: MyContext): Promise<PlanSectionProgress[]> => {
      if (parent?.id) {
        return await PlanSectionProgress.findByPlanId('plan sections resolver', context, parent.id);
      }
      return [];
    }
  },

  PlanSearchResult: {
    sections: async (parent: PlanSearchResult, _, context: MyContext): Promise<PlanSectionProgress[]> => {
      if (parent?.id) {
        return await PlanSectionProgress.findByPlanId('plan sections resolver', context, parent.id);
      }
      return [];
    }
  },
}
