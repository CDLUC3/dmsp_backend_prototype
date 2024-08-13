import { Resolvers } from "../types";
import { TemplateCollaborator } from "../models/Collaborator";
import  { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Query: {
    // Get all of the Users that belong to another affiliation that can edit the Template
    templateCollaborators: async (_, { templateId }, context: MyContext): Promise<TemplateCollaborator[]> => {
      return await TemplateCollaborator.findByTemplateId('templateCollaborators resolver', context, templateId);
    },
  },

  TemplateCollaborator: {
    template: async (parent: TemplateCollaborator, _, context: MyContext) => {
      return Template.findById('Chained TemplateCollaborator.template', context, parent.templateId);
    },

    // Chained resolver to fetch the Affiliation info for the user
    invitedBy: async (parent: TemplateCollaborator, _, context: MyContext) => {
      return User.findById('Chained TemplateCollaborator.invitedBy', context, parent.invitedById);
    },

    user: async (parent: TemplateCollaborator, _, context: MyContext) => {
      return User.findById('Chained TemplateController.user', context, parent.userId);
    },
  },
};
