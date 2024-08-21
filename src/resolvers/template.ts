import { Resolvers } from "../types";
import { Template } from "../models/Template";
import { MyContext } from "../context";
import { Affiliation } from "../models/Affiliation";
import { TemplateCollaborator } from "../models/Collaborator";
import { clone } from "../services/templateService";

export const resolvers: Resolvers = {
  Query: {
    // Get the Templates that belong to the current user's affiliation (user must be an Admin)
    templates: async (_, __, context: MyContext): Promise<Template[]> => {
      // TODO: perform a check here to make sure the User within the context is an Admin
      return await Template.findByUser('templates resolver', context)
    },

    // Get the specified Template (user must be an Admin)
    //    - called by the Template Overview page
    template: async (_, { templateId }, context: MyContext): Promise<Template> => {
      // TODO: perform a check here to make sure the User within the context is an Admin
      return await Template.findById('template resolver', context, templateId);
    },
  },

  Mutation: {
    // Add a new template by copying an existing one or starting from scratch (copyFromTemplateId left blank).
    //    - called by the Template Builder - prior template selection page AND the initial page
    addTemplate: async (_, { name, copyFromTemplateId }, context: MyContext): Promise<Template> => {
      const template = new Template({ name });
      if (copyFromTemplateId) {
        await clone(copyFromTemplateId, context.token?.id?.toString(), template);
      }
      // return await template.save({});
      return null;
    },

    // Update the specified template
    //    - called by the Template options page
    updateTemplate: async (_, { templateId, name, visibility }, context: MyContext): Promise<Template> => {
      const template = await Template.findById('updateTemplate resolver', context, templateId);
      if (template) {
        // return await template.save({ name, visibility });
      }
      return null;
    },

    // Unpublish the template.
    //    - called by the Template options page
    archiveTemplate: async (_, { templateId }, context: MyContext): Promise<boolean> => {
      return false;
    }
  },

  Template: {
    // Chained resolver to fetch the Affiliation info for the user
    owner: async (parent: Template, _, context: MyContext): Promise<Affiliation> => {
      return await Affiliation.findById('Chained Template.owner', context, parent.ownerId);
    },

    // Chained resolver to fetch the TemplateCollaborators
    collaborators: async (parent: Template, _, context: MyContext): Promise<TemplateCollaborator[]> => {
      return await TemplateCollaborator.findByTemplateId('Chained Template.collaborators', context, parent.id);
    },
  },
};
