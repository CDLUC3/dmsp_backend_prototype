import { Resolvers } from "../types";
import { TemplateCollaborator } from "../models/Collaborator";
import { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";
import { isAdmin, isAuthorized } from "../services/authService";
import { AuthenticationError, ForbiddenError, NotFoundError } from "../utils/graphQLErrors";

export const resolvers: Resolvers = {
  Query: {
    // Get all of the Users that belong to another affiliation that can edit the Template
    //     - called from the Template options page
    templateCollaborators: async (_, { templateId }, context: MyContext): Promise<TemplateCollaborator[]> => {
      if (isAdmin(context.token)){
        return await TemplateCollaborator.findByTemplateId('templateCollaborators resolver', context, templateId);
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
  },

  Mutation: {
    // Add a collaborator to a Template
    //     - called from the Template options page
    addTemplateCollaborator: async (_, { templateId, email }, context: MyContext): Promise<TemplateCollaborator> => {
      if (isAdmin(context.token)){
        const invitedById = context.token?.id;
        const collaborator = await new TemplateCollaborator({ templateId, email, invitedById });
        return await collaborator.create(context);
      }
      // Unauthorized! or Forbidden
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    // Remove a TemplateCollaborator from a Template
    //     - called from the Template options page
    removeTemplateCollaborator: async (_, { templateId, email }, context: MyContext): Promise<boolean> => {
      if (isAdmin(context.token)){
        const collaborator = await TemplateCollaborator.findByTemplateIdAndEmail(
          'removeTemplateCollaborator resolver',
          context,
          templateId,
          email
        );
        if (collaborator) return await collaborator.delete(context);

        // Couldn't find the TemplateCollaborator
        throw NotFoundError();
      }
      // Unauthorized! or Forbidden
      throw context?.token ? ForbiddenError() : AuthenticationError();
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
