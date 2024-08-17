import { Resolvers } from "../types";
import { Template } from "../models/Template";
import { MyContext } from "../context";
import { Affiliation } from "../models/Affiliation";
import { TemplateCollaborator } from "../models/Collaborator";

export const resolvers: Resolvers = {
  Query: {
    // Get the Templates that belong to the current user's affiliation (user must be an Admin)
    templates: async (_, __, context: MyContext): Promise<Template[]> => {
      // TODO: perform a check here to make sure the User within the context is an Admin
      return Template.findByUser('templates resolver', context)
    },

    // Get the specified Template (user must be an Admin)
    template: async (_, { templateId }, context: MyContext): Promise<Template> => {
      // TODO: perform a check here to make sure the User within the context is an Admin
      return Template.findById('template resolver', context, templateId);
    },
  },

  Template: {
    // Chained resolver to fetch the Affiliation info for the user
    owner: async (parent: Template, _, context: MyContext): Promise<Affiliation> => {
      return Affiliation.findById('Chained Template.owner', context, parent.ownerId);
    },

    // Chained resolver to fetch the TemplateCollaborators
    collaborators: async (parent: Template, _, context: MyContext): Promise<TemplateCollaborator[]> => {
      return TemplateCollaborator.findByTemplateId('Chained Template.collaborators', context, parent.id);
    },
  },
};
