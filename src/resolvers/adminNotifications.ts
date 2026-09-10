import { Resolvers } from "../types.js";
import { MyContext } from '../context.js';
import {
  AdminNotificationResults,
  AdminNotification,
} from '../models/AdminNotifications.js';
import { Plan } from '../models/Plan.js';
import { Template } from '../models/Template.js';
import { PlanFeedback } from '../models/PlanFeedback.js';
import { User } from '../models/User.js';
import {
  authenticatedResolver,
} from "../services/authService.js";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from "../utils/graphQLErrors.js";
import { prepareObjectForLogs } from "../logger.js";
import { GraphQLError } from "graphql";
import { UserRole } from "../models/User.js";
import {
  PaginatedQueryResults,
  PaginationOptionsForCursors,
  PaginationOptionsForOffsets,
  PaginationType,
} from "../types/general.js";
import { TemplateCustomization } from "../models/TemplateCustomization.js";
import {
  QueryAdminNotificationsArgs,
  QueryAdminNotificationsReadArgs,
  QueryAdminNotificationsUnreadArgs,
} from "../types.js";
import { isNullOrUndefined } from "../utils/helpers.js";

export const resolvers: Resolvers = {
  Query: {
    adminNotificationsRead: authenticatedResolver(
      'adminNotifications resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { paginationOptions }: Partial<QueryAdminNotificationsReadArgs>,
        context: MyContext
      ): Promise<PaginatedQueryResults<AdminNotificationResults>> => {
        const reference = 'adminNotifications resolver';
        const userId = context.token.id;
        const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
          ? (paginationOptions as PaginationOptionsForOffsets)
          : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;
        return await AdminNotificationResults.findReadByUserId(reference, context, userId, opts)
      }
    ),

    adminNotificationsUnread: authenticatedResolver(
      'unreadAdminNotifications resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { paginationOptions }: Partial<QueryAdminNotificationsUnreadArgs>,
        context: MyContext
      ): Promise<PaginatedQueryResults<AdminNotificationResults>> => {
        const reference = 'unreadAdminNotifications resolver';
        const userId = context.token.id;
        const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
          ? (paginationOptions as PaginationOptionsForOffsets)
          : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

        return await AdminNotificationResults.findUnreadByUserId(
          reference,
          context,
          userId,
          opts
        );
      }
    ),
    adminNotifications: authenticatedResolver(
      'adminNotifications resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { paginationOptions }: Partial<QueryAdminNotificationsArgs>,
        context: MyContext
      ): Promise<PaginatedQueryResults<AdminNotificationResults>> => {
        const reference = 'unreadAdminNotifications resolver';
        const userId = context.token.id;
        const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
          ? (paginationOptions as PaginationOptionsForOffsets)
          : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

        return await AdminNotificationResults.findByUserId(
          reference,
          context,
          userId,
          opts
        );
      }
    ),
  },

  Mutation: {
    markNotificationAsRead: authenticatedResolver(
      'markNotificationAsRead resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { id }: { id: number },
        context: MyContext
      ): Promise<boolean> => {
        const reference = 'markNotificationAsRead resolver';
        try {
          const notification = await AdminNotification.findById(reference, context, id);

          if (!notification) {
            throw NotFoundError(`AdminNotification with ID ${id} not found`);
          }

          if (context.token.id === notification.userId) {
            const updated = await notification.markAsRead(context);
            return updated !== null;
          }
          throw ForbiddenError();
        } catch (err) {
          if (err instanceof GraphQLError) throw err;
          context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
          throw InternalServerError();
        }
      }
    ),

    markNotificationAsUnRead: authenticatedResolver(
      'markNotificationAsUnRead resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { id }: { id: number },
        context: MyContext
      ): Promise<boolean> => {
        const reference = 'markNotificationAsUnRead resolver';
        try {
          const notification = await AdminNotification.findById(reference, context, id);

          if (!notification) {
            throw NotFoundError(`AdminNotification with ID ${id} not found`);
          }

          if (context.token.id === notification.userId) {
            const updated = await notification.markAsUnRead(context);
            return updated !== null;
          }
          throw ForbiddenError();
        } catch (err) {
          if (err instanceof GraphQLError) throw err;
          context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
          throw InternalServerError();
        }
      }
    ),
  },
  AdminNotificationResults: {
    // Fetch the plan associated with the notification if metadata contains a planId
    plan: async (parent, _, context: MyContext) => {
      if (parent.metadata?.planId) {
        return await Plan.findById('Chained AdminNotificationResults.plan', context, parent.metadata.planId);
      }
      return null;
    },

    // Fetch the template associated with the notification if metadata contains a templateId
    template: async (parent, _, context: MyContext) => {
      if (parent.metadata?.templateId) {
        return await Template.findById('Chained AdminNotificationResults.template', context, parent.metadata.templateId);
      }
      return null;
    },

    // Fetch the templateCustomization associated with the notification if metadata contains a templateCustomizationId
    templateCustomization: async (parent, _, context: MyContext) => {
      if (parent.metadata?.templateCustomizationId) {
        return await TemplateCustomization.findByIdWithTemplateName('Chained AdminNotificationResults.templateCustomization', context, parent.metadata.templateCustomizationId);
      }
      return null;
    },

    // Fetch the feedback associated with the plan if metadata contains a planId
    feedback: async (parent, _, context: MyContext) => {
      if (parent.metadata?.planId) {
        const feedbackList = await PlanFeedback.findByPlanId('Chained AdminNotificationResults.feedback', context, parent.metadata.planId);
        // Return the most recent open feedback round
        return feedbackList.find(fb => fb.completed === null) ?? null;
      }
      return null;
    },

    // Fetch the user who created the notification
    createdBy: async (parent, _, context: MyContext) => {
      if (parent.createdById) {
        return await User.findById('Chained AdminNotificationResults.createdBy', context, parent.createdById);
      }
      return null;
    },
  },
};
