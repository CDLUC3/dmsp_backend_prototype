import { Resolvers } from "../types";
import { TemplateCollaborator } from "../models/Collaborator";
import  { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";

export const resolvers: Resolvers = {
  Query: {
    // Get all of the Users that belong to another affiliation that can edit the Template
    //     - called from the Template options page
    templateCollaborators: async (_, { templateId }, _context: MyContext): Promise<TemplateCollaborator[]> => {
      // TODO: Add auth check here
      return await TemplateCollaborator.findByTemplateId('templateCollaborators resolver', context, templateId);
    },
  },

  Mutation: {
    // Add a collaborator to a Template
    //     - called from the Template options page
    addTemplateCollaborator: async (_, { templateId, email }, _context: MyContext): Promise<TemplateCollaborator> => {
      // TODO: Add auth check here
      const collaborator = await new TemplateCollaborator({ templateId, email });
      // await collaborator.save();
      return collaborator;
    },

    // Remove a TemplateCollaborator from a Template
    //     - called from the Template options page
    removeTemplateCollaborator: async (_, { templateId, email }, _context: MyContext): Promise<boolean> => {
      // TODO: Add auth check here
      // return await TemplateCollaborator.removeCollaborator(templateId, email);
      return false;
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
