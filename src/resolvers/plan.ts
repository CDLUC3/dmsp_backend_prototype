import { GraphQLError } from "graphql";
import { MyContext } from "../context.js";
import {
  Plan,
  PlanProgress,
  PlanSearchResult,
  PlanSectionProgress,
  PlanStatus,
  PlanVisibility
} from "../models/Plan.js";
import { Project } from "../models/Project.js";
import { User, UserRole } from "../models/User.js";
import { PlanMember, ProjectMember } from "../models/Member.js";
import { PlanFunding } from "../models/Funding.js";
import { PlanFeedback } from "../models/PlanFeedback.js";
import { Affiliation } from "../models/Affiliation.js";
import { VersionedTemplate } from "../models/VersionedTemplate.js";
import { Answer } from "../models/Answer.js";
import { ProjectCollaborator, ProjectCollaboratorAccessLevel } from "../models/Collaborator.js";
import { AlternateIdentifier } from "../models/AlternateIdentifier.js";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";
import {
  AuthenticationError,
  BadUserInputError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../utils/graphQLErrors.js";
import {
  PaginationOptions,
  PaginationOptionsForCursors,
  PaginationOptionsForOffsets,
  PaginationType
} from "../types/general.js";
import {
  AddEntirePlanInput,
  Affiliation as AffiliationGQL,
  PaginatedPlanResults,
  PlanFeedbackStatus,
  PlanSectionProgress as PlanSectionProgressGQL,
  QueryPlansArgs,
  Resolvers,
  UpdateEntirePlanInput,
  PlanVersionSnapshot
} from "../types.js";
import { prepareObjectForLogs } from "../logger.js";
import { toErrorMessage } from "@dmptool/utils";
import { MemberRole } from "../models/MemberRole.js";
import { AcceptedWork } from "../models/RelatedWork.js";
// Services
import {
  buildDataCiteXMLForPlan,
  ensureDefaultPlanContact,
  handleAsyncDeletes,
  handleAsyncUpdates,
  getPlanVersions,
  getPlanVersionSnapshot,
} from "../services/planService.js";
import {
  hasPermissionOnProject,
  isProjectReadOnlyForCurrentUser
} from "../services/projectService.js";
import {
  authenticatedResolver,
  isAdmin,
  isAuthorized,
  isSuperAdmin
} from "../services/authService.js";
import {
  addEntirePlan,
  removeEntirePlan,
  replaceEntirePlan
} from "../services/entirePlanService.js";

export const resolvers: Resolvers = {
  Query: {
    // Find all of the plans for a specified userId, with pagination and optional search term filtering
    plans: authenticatedResolver(
      'plansWithPagination resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { userId, term, paginationOptions }: QueryPlansArgs,
        context: MyContext
      ): Promise<PaginatedPlanResults> => {
        const reference = 'plansWithPagination resolver';
        try {

          const superAdmin: boolean = isSuperAdmin(context.token);

          if (!superAdmin) {
            // Admin must belong to the same affiliation as the target user
            const targetUser = await User.findById(reference, context, userId);
            if (!targetUser) throw NotFoundError(`User with ID ${userId} not found`);

            if (!(isAdmin(context.token) && context.token.affiliationId === targetUser.affiliationId)) {
              throw ForbiddenError();
            }
          }

          const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
            ? paginationOptions as PaginationOptionsForOffsets
            : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

          return await PlanSearchResult.findByUserIdWithPagination(reference, context, userId, opts, term ?? undefined);
        } catch (err) {
          if (err instanceof GraphQLError) throw err;
          context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
          throw InternalServerError();
        }
      },
    ),
    // Find all the plans for a specified project
    plansByProjectId: authenticatedResolver(
      '`plansByProjectId` resolver',
      UserRole.RESEARCHER,
      async (
        _: Record<PropertyKey, never>,
        { projectId }: { projectId: number; },
        context: MyContext
      ): Promise<Plan[]> => {
        const reference = 'plansByProjectId resolver';
        try {
          const project = await Project.findById(reference, context, projectId);
          if (!project) throw NotFoundError(`Project with ID ${projectId} not found`);

          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
            return await Plan.findByProjectId(reference, context, projectId);
          }

          throw context?.token ? ForbiddenError() : AuthenticationError();
        } catch (err) {
          if (err instanceof GraphQLError) throw err;
          context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
          throw InternalServerError();
        }
      },
    ),
    // Find the plan by its id
    plan: async (_, { planId }, context: MyContext): Promise<Plan> => {
      const reference = 'plan resolver';
      try {
        const plan = await Plan.findById(reference, context, planId);

        if (!plan) {
          throw NotFoundError(`Plan with ID ${planId} not found`);
        }

        const project = await Project.findById(reference, context, plan.projectId);
        if (!project) {
          throw NotFoundError(`Project with ID ${plan.projectId} not found`);
        }

        if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
          const readOnly = await isProjectReadOnlyForCurrentUser(reference, context, project);
          return Object.assign(plan, { readOnly }) as Plan & { readOnly: boolean };
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Find a Plan by its DMP id
    planByDMPId: async (_, { dmpId }, context: MyContext): Promise<Plan> => {
      const reference = 'planByDMPId resolver';
      try {
        const plan = await Plan.findByDMPId(reference, context, dmpId);
        if (isNullOrUndefined(plan)) {
          throw NotFoundError(`Plan with DMP id, ${dmpId}, not found`);
        }

        const project = await Project.findById(reference, context, plan.projectId);
        if (isNullOrUndefined(project)) {
          throw NotFoundError(`Project with ID, ${plan.projectId}, not found`);
        }

        if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
          return plan;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Find a published plan by its DMP id and version (publicly accessible so not checking permissions)
    publicPlanVersionByDMPId: async (_, { dmpId, version }, context: MyContext): Promise<PlanVersionSnapshot> => {
      const reference = 'publicPlanVersionByDMPId resolver';
      try {
        const snapshot = await getPlanVersionSnapshot(reference, context, dmpId, version);

        if (!snapshot) {
          throw NotFoundError(`Version ${version} of DMP ${dmpId} not found`);
        }

        return snapshot;
      } catch (err) {
        if (err instanceof GraphQLError) throw err;
        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Lookup a Plan by its alternate identifier
    planByAlternateIdentifier: async (_, { alternateIdentifier }, context: MyContext): Promise<Plan> => {
      const reference = 'planByAlternateIdentifier resolver';
      try {
        const identifier = await AlternateIdentifier.findByAlternateIdentifier(
          reference,
          context,
          alternateIdentifier
        );
        if (isNullOrUndefined(identifier)) {
          throw NotFoundError('Alternate identifier not found');
        }

        const plan = await Plan.findById(reference, context, identifier.planId);
        if (isNullOrUndefined(plan)) {
          throw NotFoundError(`Plan with ID, ${identifier.planId}, not found`);
        }

        const project = await Project.findById(reference, context, plan.projectId);
        if (isNullOrUndefined(project)) {
          throw NotFoundError(`Project with ID, ${plan.projectId}, not found`);
        }

        if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
          return plan;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
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

          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.EDIT)) {
            // No title is collected by this mutation; leave it blank so Plan.isValid() flags
            // it the same way an undefined title would have prior to strict null checks.
            const plan = new Plan({ projectId, versionedTemplateId, title: '' });
            const created = await plan.create(context);

            if (!isNullOrUndefined(created.id) && !created.hasErrors()) {
              // Add the project's primary contact as the primary contact for the new plan
              const contactWasSet = await ensureDefaultPlanContact(context, created, project);
              if (!contactWasSet) {
                created.addError('general', 'Unable to set the default contact');
              }

              // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
              await handleAsyncUpdates(reference, context, created);
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

    // Delete a plan
    archivePlan: async (_, { planId }, context: MyContext): Promise<Plan> => {
      const reference = 'archive plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with id ${planId} not found`);
          }

          if (plan.isPublished()) {
            plan.addError('general', 'Plan is already published and cannot be archived');
          }

          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            if (!plan.hasErrors()) {
              const deleted = await plan.delete(context);

              if (deleted) {
                // Handle OpenSearch index removal and removal of maDMP JSON versions
                await handleAsyncDeletes(reference, context, deleted);
              }
            } else {
              return plan;
            }
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
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
          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.EDIT)) {
            // `fileName`/`fileContent` are not persisted Plan fields (this mutation is not yet
            // implemented), so only the fields the Plan model actually accepts are passed through.
            const plan = new Plan({ projectId, versionedTemplateId: 0, title: fileName ?? '' });

            // TODO: Figure out what would be passed in from the client and how we'd get the actual
            //       file content and push it into an S3 bucket
            plan.addError('general', 'Uploads have not yet been implemented');
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
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
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            if (!plan.hasErrors()) {
              if (project.isTestProject) {
                plan.addError('general', 'Test projects cannot be published');
              } else if (plan.isPublished()) {
                plan.addError('general', 'Plan is already published');
              }

              if (!plan.hasErrors()) {
                // Add the project's primary contact as the primary contact for the new plan
                const contactWasSet = await ensureDefaultPlanContact(context, plan, project);
                if (!contactWasSet) {
                  plan.addError('general', 'Plan must have a primary contact');
                } else {
                  // Build the DataCite XML metadata document before publishing
                  let dataciteXML: string;
                  try {
                    dataciteXML = await buildDataCiteXMLForPlan(context, plan);
                  } catch (err) {
                    context.logger.error(
                      prepareObjectForLogs(err),
                      `${reference} failed to build DataCite metadata`
                    );
                    plan.addError('general', 'Unable to build metadata required to publish this plan');
                    return plan;
                  }

                  // All criteria was satisfied, so publish the plan
                  const published = await plan.publish(context, visibility as PlanVisibility, dataciteXML);

                  if (published && !published.hasErrors()) {
                    // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
                    await handleAsyncUpdates(reference, context, published);
                  }
                  return published;
                }
              }
            }
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    updatePlan: async (_, { input }, context: MyContext): Promise<Plan> => {
      const reference = 'update plan resolver';
      try {
        if (isAuthorized(context.token)) {
          if (isNullOrUndefined(input.id)) {
            throw NotFoundError(`Plan with id ${input.id} not found`);
          }
          const plan = await Plan.findById(reference, context, input.id);
          if (!plan) {
            throw NotFoundError(`Plan with id ${input.id} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            plan.title = input.title ?? plan.title;
            plan.status = input.status as PlanStatus ?? plan.status;
            plan.visibility = input.visibility as PlanVisibility ?? plan.visibility;
            plan.featured = input.featured ?? plan.featured;
            plan.languageId = input.languageId ?? plan.languageId;

            const updated = await plan.update(context);

            if (updated && !updated.hasErrors()) {
              // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
              await handleAsyncUpdates(reference, context, updated);
            }
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

    updatePlanStatus: async (_, { planId, status }, context: MyContext): Promise<Plan> => {
      const reference = 'update plan status resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with id ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            plan.status = status as PlanStatus;
            const updated = await plan.update(context);

            if (updated && !updated.hasErrors()) {
              // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
              await handleAsyncUpdates(reference, context, updated);
            }
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

    updatePlanTitle: async (_, { planId, title }, context: MyContext): Promise<Plan> => {
      const reference = 'update plan title resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with id ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            plan.title = title;
            const updated = await plan.update(context);

            if (updated && !updated.hasErrors()) {
              // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
              await handleAsyncUpdates(reference, context, updated);
            }
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

    // Assign an alternate identifier to the plan
    addAlternateIdentifierToPlan: async (_, { planId, alternateIdentifier }, context: MyContext): Promise<Plan> => {
      const reference = 'add alternate identifier to plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with id ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            const identifier = new AlternateIdentifier({ planId, alternateIdentifier });

            const created = await identifier.create(context);
            if (created && !created.hasErrors()) {
              // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
              await handleAsyncUpdates(reference, context, plan);
            }
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Assign an alternate identifier to the plan
    removeAlternateIdentifierFromPlan: async (_, { planId, alternateIdentifier }, context: MyContext): Promise<Plan> => {
      const reference = 'remove alternate identifier from plan resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with id ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.OWN)) {
            const identifier = await AlternateIdentifier.findByAlternateIdentifier(
              reference,
              context,
              alternateIdentifier
            );
            if (isNullOrUndefined(identifier)) {
              throw NotFoundError('Alternate identifier not found');
            }
            if (identifier.planId !== planId) {
              throw ForbiddenError('Alternate identifier belongs to a different plan');
            }

            const deleted = await identifier.delete(context);
            if (deleted && !deleted.hasErrors()) {
              // Handle OpenSearch index update and maDMP JSON versioning in Dynamo
              await handleAsyncUpdates(reference, context, plan);
            }
            return plan;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    /**
     * AUTHENTICATED USERS ONLY: Create an entire plan (and project if applicable)
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the entire plan input (including project, members, funding and answers)
     * @param context The Apollo context
     * @returns The QuestionCustomization (with errors if applicable)
     * @throws NotFoundError when the QuestionCustomization or TemplateCustomization
     * are not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    addEntirePlan: authenticatedResolver(
      'addEntirePlan resolver',
      UserRole.RESEARCHER,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: AddEntirePlanInput },
        context: MyContext
      ): Promise<Plan> => {
        const ref = 'addEntirePlan';
        // Placeholder used only to carry validation errors if something fails below;
        // the real Plan is created by `addEntirePlan` further down.
        const plan = new Plan({ projectId: 0, versionedTemplateId: 0, title: '' });

        try {
          // 1st: Check any alternate identifiers to make sure the Plan doesn't already exist
          if (input.alternateIdentifiers) {
            const altId = await AlternateIdentifier.findByAlternateIdentifiers(
              ref,
              context,
              input.alternateIdentifiers
            );
            if (altId) {
              throw BadUserInputError('A plan with the specified alternate identifier(s) already exists.');
            }
          }

          // Add the Plan within a database transaction
          return await context.dataSources.sqlDataSource.withTransaction(context, async (): Promise<Plan> => {
            const created: Plan = await addEntirePlan(ref, context, input, plan);
            if (created && !created.hasErrors()) {
              // If successful, add the OpenSearch index in the background
              await handleAsyncUpdates(ref, context, created);
            }
            return created;
          });
        } catch (error) {
          if (error instanceof GraphQLError) {
            if (error.extensions?.code === 'BAD_REQUEST') {
              plan.addError(
                'general',
                `Unable to process your request. ${error.message}`
              );
              // Return the plan with its populated validation errors
              return plan;
            } else {
              throw error;
            }
          }

          // Log unexpected errors and throw 500
          context.logger.error(
            prepareObjectForLogs({ ref, error: toErrorMessage(error) }),
            `Failure in ${ref}`
          );
          throw InternalServerError();
        }
      }
    ),

    /**
     * AUTHENTICATED USERS ONLY: Replace an entire plan (and project if applicable)
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the entire plan input (including project, members, funding and answers)
     * @param context The Apollo context
     * @returns The QuestionCustomization (with errors if applicable)
     * @throws NotFoundError when the QuestionCustomization or TemplateCustomization
     * are not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    updateEntirePlan: authenticatedResolver(
      'updateEntirePlan resolver',
      UserRole.RESEARCHER,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: UpdateEntirePlanInput },
        context: MyContext
      ): Promise<Plan> => {
        const ref = 'updateEntirePlan';

        // 1st: Find the Plan and Project
        if (isNullOrUndefined(input.id)) {
          throw NotFoundError();
        }
        const plan = await Plan.findById(ref, context, input.id);
        if (!plan) {
          throw NotFoundError();
        }
        const project = await Project.findById(ref, context, plan.projectId);
        if (!project) {
          throw NotFoundError();
        }

        if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.EDIT)) {
          try {
            // Add the Plan within a database transaction
            return await context.dataSources.sqlDataSource.withTransaction(context, async (): Promise<Plan> => {
              const replaced: Plan = await replaceEntirePlan(ref, context, project, plan, input);
              if (replaced && !replaced.hasErrors()) {
                // If successful, update the OpenSearch index in the background
                await handleAsyncUpdates(ref, context, replaced);
              }
              return replaced;
            });
          } catch (error) {
            if (error instanceof GraphQLError) {
              if (error.extensions?.code === 'BAD_REQUEST') {
                plan.addError(
                  'general',
                  `Unable to process your request. ${error.message}`
                );
                // Return the plan with its populated validation errors
                return plan;
              } else {
                throw error;
              }
            }

            // Log unexpected errors and throw 500
            context.logger.error(
              prepareObjectForLogs({ ref, error: toErrorMessage(error) }),
              `Failure in ${ref}`
            );
            throw InternalServerError();
          }
        } else {
          throw context.token ? ForbiddenError() : AuthenticationError();
        }
      }
    ),

    /**
     * AUTHENTICATED USERS ONLY: Delete/tomb-stone an entire plan (and project if applicable)
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the DMP id of the plan
     * @param context The Apollo context
     * @returns The QuestionCustomization (with errors if applicable)
     * @throws NotFoundError when the QuestionCustomization or TemplateCustomization
     * are not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    removeEntirePlanByDMPId: authenticatedResolver(
      'removeEntirePlanByDMPId resolver',
      UserRole.RESEARCHER,
      async (
        _: Record<PropertyKey, never>,
        { dmpId }: { dmpId: string },
        context: MyContext
      ): Promise<boolean> => {
        const ref = 'updateEntirePlan';

        // 1st: Find the Plan and Project
        const plan = await Plan.findByDMPId(ref, context, dmpId);
        if (!plan) {
          throw NotFoundError();
        }
        const project = await Project.findById(ref, context, plan.projectId);
        if (!project) {
          throw NotFoundError();
        }

        if (await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.EDIT)) {
          try {
            // Add the Plan within a database transaction
            const removed: Plan | undefined = await context.dataSources.sqlDataSource.withTransaction(context, async (): Promise<Plan> => {
              const oldPlan: Plan = await removeEntirePlan(ref, context, project, plan);
              if (oldPlan && !oldPlan.hasErrors()) {
                // If successful, remove the OpenSearch index
                await handleAsyncDeletes(ref, context, oldPlan);
              }
              return oldPlan
            });
            return removed && !removed.hasErrors();
          } catch (err) {
            if (err instanceof GraphQLError) throw err;

            context.logger.error(prepareObjectForLogs(err), `Failure in ${ref}`);
            throw InternalServerError();
          }
        } else {
          throw context.token ? ForbiddenError() : AuthenticationError();
        }
      }
    ),
  },

  // NOTE: `parent` below is typed to the GraphQL-facing shape (no raw FK fields like
  // projectId/versionedTemplateId/createdById), but at runtime it is actually the model
  // instance returned by the parent resolver, so it's cast back via `as unknown as X`.
  Plan: {
    // The user who owns/created the plan
    planCreator: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Plan;
      if (model?.createdById) {
        return await User.findById('plan.createdBy resolver', context, model.createdById);
      }
      return null;
    },
    owner: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Plan;
      if (!model?.id) return null;
      const reference = 'Chained Plan.owner';

      // First, try to get the project owner (collaborator with OWN access level)
      const projectOwner = await ProjectCollaborator.findOwnerByProjectId(
        reference,
        context,
        model.projectId
      );

      if (projectOwner?.userId) {
        const user = await User.findById(reference, context, projectOwner.userId);
        if (user?.affiliationId) {
          const affiliation = await Affiliation.findByURI(reference, context, user.affiliationId);
          // The Affiliation model has a few fields (e.g. `name`, `uri`) typed optional that
          // the generated GraphQL type marks as required, so bridge it like the parent cast above.
          if (affiliation) return affiliation as unknown as AffiliationGQL;
        }
      }

      // Fall back to the plan creator's affiliation
      if (model?.createdById) {
        const user = await User.findById(reference, context, model.createdById);
        if (user?.affiliationId) {
          const affiliation = await Affiliation.findByURI(reference, context, user.affiliationId);
          return affiliation as unknown as AffiliationGQL;
        }
      }

      return null;
    },

    // The project the plan is associated with
    project: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Plan;
      if (model?.projectId) {
        return await Project.findById('project resolver', context, model.projectId);
      }
      return null;
    },
    // The template the plan is based on
    versionedTemplate: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Plan;
      if (model?.versionedTemplateId) {
        return await VersionedTemplate.findById('versioned template resolver', context, model.versionedTemplateId);
      }
      return null;
    },
    // The members to the plan
    members: async (parent, _, context: MyContext): Promise<PlanMember[]> => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        return await PlanMember.findByPlanId('plan members resolver', context, model.id);
      }
      return [];
    },
    // The funding sources for the plan
    fundings: async (parent, _, context: MyContext): Promise<PlanFunding[]> => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        return await PlanFunding.findByPlanId('plan fundings resolver', context, model.id);
      }
      return [];
    },
    // The feedback associated with the plan
    feedback: async (parent, _, context: MyContext): Promise<PlanFeedback[]> => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        return await PlanFeedback.findByPlanId('plan feedback resolver', context, model.id);
      }
      return [];
    },
    feedbackStatus: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        // Use the same logic as in planFeedbackStatus query
        return await PlanFeedback.statusForPlan('plan.feedbackStatus resolver', context, model.id);
      }
      return null;
    },
    answers: async (parent, _, context: MyContext): Promise<Answer[]> => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        return await Answer.findByPlanId('plan answers resolver', context, model.id);
      }
      return [];
    },
    versionedSections: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        // The model's `tags` field (via models/Tag.js) isn't perfectly structurally
        // identical to the generated GraphQL `Tag` type (e.g. `slug` is required there),
        // so bridge it the same way the parent cast above does.
        return await PlanSectionProgress.findByPlanId(
          'plan versionedSections resolver', context, model.id, model?.versionedTemplateId
        ) as unknown as PlanSectionProgressGQL[];
      }
      return [];
    },
    progress: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        return await PlanProgress.findByPlanId('plan progress resolver', context, model.id, model?.versionedTemplateId);
      }
      return null;
    },
    alternateIdentifiers: async (parent, _, context: MyContext): Promise<AlternateIdentifier[]> => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        return await AlternateIdentifier.findByPlanId('plan alternateIdentifiers chained resolver', context, model.id);
      }
      return [];
    },
    acceptedWorks: async (parent, _, context: MyContext): Promise<AcceptedWork[]> => {
      const model = parent as unknown as Plan;
      if (model?.id) {
        return await AcceptedWork.findByPlanId('plan acceptedWorks chained resolver', context, model.id);
      }
      return [];
    },
    registered: (parent) => {
      const model = parent as unknown as Plan;
      return normaliseDateTime(model.registered);
    },
    versions: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Plan;
      if (!model?.dmpId) return [];
      return await getPlanVersions('Chained Plan.versions', context, model.dmpId);
    },
    created: (parent) => {
      const model = parent as unknown as Plan;
      return normaliseDateTime(model.created);
    },
    modified: (parent) => {
      const model = parent as unknown as Plan;
      return normaliseDateTime(model.modified);
    }
  },

  PlanSearchResult: {
    versionedSections: async (parent, _, context: MyContext) => {
      const model = parent as unknown as PlanSearchResult;
      if (model?.id) {
        return await PlanSectionProgress.findByPlanId(
          'planSearchresult versionedSections resolver',
          context,
          model.id,
          model?.versionedTemplateId
        ) as unknown as PlanSectionProgressGQL[];
      }
      return [];
    },
    templateOwnerAffiliationName: async (parent, _, context: MyContext) => {
      const model = parent as unknown as PlanSearchResult;
      if (!model?.versionedTemplateId) return null;

      const versionedTemplate = await VersionedTemplate.findById(
        'planSearchResult.templateOwnerAffiliationName resolver',
        context,
        model.versionedTemplateId
      );
      if (!versionedTemplate?.ownerId) return null;

      const affiliation = await Affiliation.findByURI(
        'planSearchResult.templateOwnerAffiliationName resolver',
        context,
        versionedTemplate.ownerId
      );
      return affiliation?.displayName || null;
    },
    planCreator: async (parent, _, context: MyContext) => {
      const model = parent as unknown as PlanSearchResult;
      if (model?.createdById) {
        return await User.findById('planSearchResult.planCreator resolver', context, model.createdById);
      }
      return null;
    }
  },
  PlanMember: {
    projectMember: async (parent, _, context: MyContext) => {
      const model = parent as unknown as PlanMember;
      if (model?.projectMemberId) {
        return await ProjectMember.findById('planMember.projectMember resolver', context, model.projectMemberId);
      }
      return null;
    },
    memberRoles: async (parent, _, context: MyContext): Promise<MemberRole[]> => {
      const model = parent as unknown as PlanMember;
      if (model?.id) {
        return await MemberRole.findByPlanMemberId('planMember.memberRoles resolver', context, model.id);
      }
      return [];
    },
  },

}
