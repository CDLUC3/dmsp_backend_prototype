import { GraphQLError } from "graphql";
import { MyContext } from "../context";
import { Plan, PlanSearchResult, PlanSectionProgress, PlanStatus, PlanVisibility } from "../models/Plan";
import { formatLogMessage } from "../logger";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { Project } from "../models/Project";
import { isAuthorized } from "../services/authService";
import { hasPermissionOnProject } from "../services/projectService";
import { PlanMember } from "../models/Member";
import { PlanFunding } from "../models/Funding";
import { Resolvers } from "../types";
import { VersionedTemplate } from "../models/VersionedTemplate";
import { Answer } from "../models/Answer";
import { ProjectCollaboratorAccessLevel } from "../models/Collaborator";

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
        if (project && await hasPermissionOnProject(context, project)) {
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
          const versionedTemplate = await VersionedTemplate.findById(reference, context, versionedTemplateId);

          if (!project) {
            throw NotFoundError(`Project with ID ${projectId} not found`);
          }
          if (!versionedTemplate) {
            throw NotFoundError(`Template with ID ${versionedTemplateId} not found`);
          }

          if (await hasPermissionOnProject(context, project)) {
            const plan = new Plan({ projectId, versionedTemplateId });
            return plan.create(context);
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
    archivePlan: async (_, { planId }, context: MyContext): Promise<Plan> => {
      const reference = 'archive plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with id ${planId} not found`);
          }

          const project = await Project.findById(reference, context, plan.projectId);
          if (plan.isPublished()) {
            plan.addError('general', 'Plan is already published and cannot be archived');
          }

          if (await hasPermissionOnProject(context, project)) {
            if (!plan.hasErrors()) {
              return await plan.delete(context);
            } else {
              return plan;
            }
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
    publishPlan: async (_, { planId, visibility = PlanVisibility.PRIVATE }, context: MyContext): Promise<Plan> => {
      const reference = 'publish plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with id ${planId} not found`);
          }
          if (plan.isPublished()) {
            plan.addError('general', 'Plan is already published');
          }

          const project = await Project.findById(reference, context, plan.projectId);
          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            if (!plan.hasErrors()) {
              if (project.isTestProject) {
                plan.addError('general', 'Test projects cannot be published');
              } else if (plan.isPublished()) {
                plan.addError('general', 'Plan is already published');
              }

              if (!plan.hasErrors()) {
                plan.visibility = visibility as PlanVisibility;
                return await plan.publish(context);
              }
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

    updatePlanStatus: async (_, { planId, status }, context: MyContext): Promise<Plan> => {
      const reference = 'update plan status resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with id ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            plan.status = status as PlanStatus;
            return await plan.update(context);
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
    // The members to the plan
    members: async (parent: Plan, _, context: MyContext): Promise<PlanMember[]> => {
      if (parent?.id) {
        return await PlanMember.findByPlanId('plan members resolver', context, parent.id);
      }
      return [];
    },
    // The funding sources for the plan
    fundings: async (parent: Plan, _, context: MyContext): Promise<PlanFunding[]> => {
      if (parent?.id) {
        return await PlanFunding.findByPlanId('plan fundings resolver', context, parent.id);
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
