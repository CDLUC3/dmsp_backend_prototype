import { GraphQLError } from "graphql";
import { MyContext } from "../context";
import { Plan } from "../models/Plan";
import { PlanFeedback } from "../models/PlanFeedback";
import { prepareObjectForLogs } from "../logger";
import {
  AuthenticationError,
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from "../utils/graphQLErrors";
import { Project } from "../models/Project";
import { isAuthorized } from "../services/authService";
import { hasPermissionOnProject } from "../services/projectService";
import { sendProjectCollaboratorsAddedCommentEmail } from '../services/emailService';
import { Resolvers } from "../types";
import { User } from "../models/User";
import { PlanFeedbackComment } from "../models/PlanFeedbackComment";
import { ResolversParentTypes } from "../types";
import { getCurrentDate } from "../utils/helpers";

type PlanFeedbackParent = ResolversParentTypes['PlanFeedback'] & {
  requestedById?: number;
  completedById?: number;
};


export const resolvers: Resolvers = {
  Query: {
    // return all rounds of admin feedback for the plan
    planFeedback: async (_, { planId }, context: MyContext): Promise<PlanFeedback[]> => {
      const reference = 'feedback resolver';
      try {
        if (isAuthorized(context.token)) {
          // Check to see if planId exists in our records
          const plan = await Plan.findById(reference, context, planId);
          if (!planId) {
            throw NotFoundError(`Plan with ID ${planId} not found`);
          }

          // Check that user has permissions to access feedback
          const projectId = plan.projectId;
          const project = await Project.findById(reference, context, projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project)) {
            const temp = await PlanFeedback.findByPlanId(reference, context, planId);
            console.log("****PLAN FEEDBACK", temp);
            return temp;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Get all of the comments associated with the round of admin feedback
    planFeedbackComments: async (_, { planId, planFeedbackId }, context: MyContext): Promise<PlanFeedbackComment[]> => {
      const reference = 'feedback resolver';
      try {
        if (isAuthorized(context.token)) {
          // Check to see if planId exists in our records
          const plan = await Plan.findById(reference, context, planId);
          if (!planId) {
            throw NotFoundError(`Plan with ID ${planId} not found`);
          }

          // Check that user has permissions to access feedback
          const projectId = plan.projectId;
          const project = await Project.findById(reference, context, projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${projectId} not found`);
          }
          if (await hasPermissionOnProject(context, project)) {
            return await PlanFeedbackComment.findByFeedbackId(reference, context, planFeedbackId);
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
    //Request a round of admin feedback
    requestFeedback: async (_, { planId }, context: MyContext): Promise<PlanFeedback> => {
      const reference = 'requestFeedback resolver';

      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with ID ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project)) {
            const feedbackComment = new PlanFeedback({
              planId,
              requestedById: context.token.id,
              requested: getCurrentDate()
            });

            return await feedbackComment.create(context);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Mark the feedback round as complete
    completeFeedback: async (_, { planId, planFeedbackId, summaryText }, context: MyContext): Promise<PlanFeedback> => {
      const reference = 'completeFeedback resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with ID ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project)) {
            const feedbackComment = await PlanFeedback.findById(reference, context, planFeedbackId);

            const newFeedbackComment = new PlanFeedback({
              id: feedbackComment.id,
              planId: feedbackComment.planId,
              requested: feedbackComment.requested,
              requestedById: feedbackComment.requestedById,
              completedById: context.token.id,
              completed: getCurrentDate(),
              summaryText: summaryText
            });

            return await newFeedbackComment.update(context);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Add feedback comment to an answer within a round of feedback
    addFeedbackComment: async (_, { planId, planFeedbackId, answerId, commentText }, context: MyContext): Promise<PlanFeedbackComment> => {
      const reference = 'addFeedbackComment resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with ID ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project)) {
            // Send out email to project collaborators to let them know that comments were added
            await sendProjectCollaboratorsAddedCommentEmail(context, context.token.email, context.token.id)

            const feedbackComment = new PlanFeedbackComment({ answerId, feedbackId: planFeedbackId, commentText });
            return await feedbackComment.create(context);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    //Update feedback comment for an answer within a round of feedback
    updateFeedbackComment: async (_, { planId, planFeedbackCommentId, commentText }, context: MyContext): Promise<PlanFeedbackComment> => {
      const reference = 'updateFeedbackComment resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with ID ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project)) {
            // Get referenced feedbackComment
            const feedbackComment = await PlanFeedbackComment.findById(reference, context, planFeedbackCommentId);

            if (!feedbackComment) {
              throw NotFoundError(`Feedback comment with id ${planFeedbackCommentId} not found`);
            }

            // Only user who added the comment can update it
            if (feedbackComment.createdById === context.token.id) {
              // Update the comment
              feedbackComment.commentText = commentText;
              return await feedbackComment.update(context);
            }

            throw ForbiddenError(`Inadequate permission to update feedback comment ${feedbackComment.id}`)
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    //Remove comment for an answer within a round of feedback
    removeFeedbackComment: async (_, { planId, planFeedbackCommentId }, context: MyContext): Promise<PlanFeedbackComment> => {
      const reference = 'removeFeedbackComment resolver';
      try {
        if (isAuthorized(context.token)) {
          const plan = await Plan.findById(reference, context, planId);
          if (!plan) {
            throw NotFoundError(`Plan with ID ${planId} not found`);
          }
          const project = await Project.findById(reference, context, plan.projectId);
          if (!project) {
            throw NotFoundError(`Project with ID ${plan.projectId} not found`);
          }

          if (await hasPermissionOnProject(context, project)) {
            // Get referenced feedbackComment
            const feedbackComment = await PlanFeedbackComment.findById(reference, context, planFeedbackCommentId);

            if (!feedbackComment) {
              throw NotFoundError(`Feedback comment with id ${planFeedbackCommentId} not found`);
            }

            // Only user who added the comment can delete it
            if (feedbackComment.createdById === context.token.id) {
              // Delete the comment
              return await feedbackComment.delete(context);
            }

            throw ForbiddenError(`Inadequate permission to delete feedback comment ${feedbackComment.id}`)

          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  PlanFeedback: {
    // The plan the feedback is associated with
    plan: async (parent, _, context: MyContext): Promise<Plan> => {
      if (parent?.plan?.id) {
        return await Plan.findById('Feedback plan resolver', context, parent.plan?.id);
      }
      return null;
    },
    // The user id that the feedback belongs to
    requestedBy: async (parent: PlanFeedbackParent, _, context: MyContext): Promise<User> => {
      if (parent?.requestedById) {
        return await User.findById('User resolver', context, parent?.requestedById);
      }
      return null;
    },
    // The completed by user id that the feedback belongs to
    completedBy: async (parent: PlanFeedbackParent, _, context: MyContext): Promise<User> => {
      if (parent?.completedById) {
        return await User.findById('User resolver', context, parent?.completedById);
      }
      return null;
    },
    feedbackComments: async (parent, _, context: MyContext): Promise<PlanFeedbackComment[]> => {
      return await PlanFeedbackComment.findByFeedbackId('Chained PlanFeedback.feedbackComments', context, parent.id)
    }
  },
  PlanFeedbackComment: {
    // Resolver to get the user who created the comment
    user: async (parent: PlanFeedbackComment, _, context: MyContext): Promise<User> => {
      if (parent?.createdById) {
        return await User.findById('PlanFeedbackComment user resolver', context, parent.createdById);
      }
      return null;
    },
  }
}
