import { Resolvers } from "../types";
import { TemplateCollaborator } from "../models/Collaborator";
import { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";
import { isAdmin } from "../services/authService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { hasPermissionOnTemplate } from "../services/templateService";
import { formatLogMessage } from "../logger";

export const resolvers: Resolvers = {
  Query: {
    // Get all of the Users that belong to another affiliation that can edit the Template
    //     - called from the Template options page
    templateCollaborators: async (_, { templateId }, context: MyContext): Promise<TemplateCollaborator[]> => {
      const reference = 'templateCollaborators resolver';
      try {
        // if the user is an admin
        if (isAdmin(context.token)){
          const template = await Template.findById(reference, context, templateId);
          // If the user has permission on the Template
          if (template && hasPermissionOnTemplate(context, template)) {
            return await TemplateCollaborator.findByTemplateId(reference, context, templateId);
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Mutation: {
    // Add a collaborator to a Template
    //     - called from the Template options page
    addTemplateCollaborator: async (_, { templateId, email }, context: MyContext): Promise<TemplateCollaborator> => {
      const reference = 'addTemplateCollaborator resolver';
      try {
        // if the user is an admin
        if (isAdmin(context.token)){
          const template = await Template.findById(reference, context, templateId);
          // If the user has permission on the Template
          if (template && hasPermissionOnTemplate(context, template)) {
            const invitedById = context.token?.id;
            const collaborator = await new TemplateCollaborator({ templateId, email, invitedById });
            const created = await collaborator.create(context);

            if (created?.id) {
              return created;
            }

            // A null was returned so add a generic error and return it
            if (!collaborator.errors['general']) {
              collaborator.addError('general', 'Unable to create Collaborator');
            }
            return collaborator;
          }
        }
        // Unauthorized! or Forbidden
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Remove a TemplateCollaborator from a Template
    //     - called from the Template options page
    removeTemplateCollaborator: async (_, { templateId, email }, context: MyContext): Promise<boolean> => {
      const reference = 'removeTemplateCollaborator resolver';
      try {
        if (isAdmin(context.token)){
          const template = await Template.findById(reference, context, templateId);
          // If the user has permission on the Template
          if (template && hasPermissionOnTemplate(context, template)) {
            const collaborator = await TemplateCollaborator.findByTemplateIdAndEmail(
              'removeTemplateCollaborator resolver',
              context,
              templateId,
              email
            );
            if (collaborator) {
              return await collaborator.delete(context);
            }

            // Couldn't find the TemplateCollaborator
            throw NotFoundError();
          }
        }
        // Unauthorized! or Forbidden
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  TemplateCollaborator: {
    // Chained resolver to fetch the Template info
    template: async (parent: TemplateCollaborator, _, context: MyContext): Promise<Template> => {
      return await Template.findById('Chained TemplateCollaborator.template', context, parent.templateId);
    },

    // Chained resolver to fetch the Affiliation info for the user
    invitedBy: async (parent: TemplateCollaborator, _, context: MyContext): Promise<User> => {
      return await User.findById('Chained TemplateCollaborator.invitedBy', context, parent.invitedById);
    },

    // Chained resolver to fetch the User record
    user: async (parent: TemplateCollaborator, _, context: MyContext): Promise<User> => {
      return await User.findById('Chained TemplateController.user', context, parent.userId);
    },
  },
};
