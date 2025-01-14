import { Resolvers } from "../types";
import { Template, TemplateVisibility } from "../models/Template";
import { MyContext } from "../context";
import { Affiliation } from "../models/Affiliation";
import { TemplateCollaborator } from "../models/Collaborator";
import { Section } from "../models/Section";
import { cloneTemplate, generateTemplateVersion, hasPermissionOnTemplate } from "../services/templateService";
import { isAdmin, isSuperAdmin } from "../services/authService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { VersionedTemplate, TemplateVersionType } from "../models/VersionedTemplate";

export const resolvers: Resolvers = {
  Query: {
    // Get the Templates that belong to the current user's affiliation (user must be an Admin)
    templates: async (_, __, context: MyContext): Promise<Template[]> => {
      if (isAdmin(context.token)) {
        return await Template.findByUser('templates resolver', context);
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    // Get the specified Template (user must be an Admin)
    //    - called by the Template Overview page
    template: async (_, { templateId }, context: MyContext): Promise<Template> => {
      if (isAdmin(context.token)) {
        const template = await Template.findById('template resolver', context, templateId);
        if (template) {
          // Verify that the current user has permission to access the Template
          if (hasPermissionOnTemplate(context, template)) {
            return template;
          }
          throw ForbiddenError();
        }
        throw NotFoundError();
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
    // Get all public templates
    publicTemplates: async (_, __, context: MyContext): Promise<Template[]> => {
      return await Template.findPublicTemplates('templates resolver', context);
    },
  },

  Mutation: {
    // Add a new template by copying an existing one or starting from scratch (copyFromTemplateId left blank).
    //    - called by the Template Builder - prior template selection page AND the initial page
    addTemplate: async (_, { name, copyFromTemplateId }, context: MyContext): Promise<Template> => {
      if (isAdmin(context.token)) {
        let template;
        if (copyFromTemplateId) {
          // Fetch the VersionedTemplate we are cloning
          const original = await VersionedTemplate.findVersionedTemplateById(
            'addTemplate resolver',
            context,
            copyFromTemplateId
          );
          template = await cloneTemplate(context.token?.id, context.token.affiliationId, original);
          template.name = name;
        }
        if (!template) {

          // Create a new blank template
          template = new Template({ name, ownerId: context.token.affiliationId });
        }

        return await template.create(context);
      }
      return null;
    },

    // Update the specified template
    //    - called by the Template options page
    updateTemplate: async (_, { templateId, name, visibility, bestPractice }, context: MyContext): Promise<Template> => {
      if (isAdmin(context.token)) {
        const template = await Template.findById('updateTemplate resolver', context, templateId);

        // Need to create an instance of template in order to access the "update" method below
        const templateInstance = new Template({
          ...template
        });

        // Only allow the bestPractice flag to be changed if the user is a Super admin!
        templateInstance.bestPractice = isSuperAdmin(context.token) ? bestPractice : template.bestPractice;

        if (templateInstance) {
          if (hasPermissionOnTemplate(context, template)) {
            // Update the fields and then save
            templateInstance.name = name;
            templateInstance.visibility = TemplateVisibility[visibility];
            return await templateInstance.update(context);
          }
          throw ForbiddenError();
        }
        throw NotFoundError();
      }
      return null;
    },

    // Unpublish the template.
    //    - called by the Template options page
    archiveTemplate: async (_, { templateId }, context: MyContext): Promise<boolean> => {
      if (isAdmin(context.token)) {
        // TODO: Once we have plans and overlays in place, update this so that it does not
        //       get deleted and orphan those records but instead just unpublishes and sets a flag

        const template = await Template.findById('archiveTemplate resolver', context, templateId);
        // Need to create an instance of template in order to access the "delete" method below
        const templateInstance = new Template({
          ...template
        });
        if (templateInstance) {
          if (hasPermissionOnTemplate(context, template)) {
            return await templateInstance.delete(context);
          }
          throw ForbiddenError();
        }
        throw NotFoundError();
      }
      return false;
    },

    // Publish the template or save as a draft
    //     - called from the Template overview page
    createTemplateVersion: async (_, { templateId, comment, versionType, visibility }, context: MyContext): Promise<Template> => {
      if (isAdmin(context.token)) {
        const reference = 'createVersion resolver';
        const template = await Template.findById(reference, context, templateId);
        // Need to create an instance of template in order to access the "update" method below
        const templateInstance = new Template({
          ...template
        });

        if (templateInstance) {
          if (hasPermissionOnTemplate(context, template)) {
            const versions = await VersionedTemplate.findByTemplateId(reference, context, templateId);


            const versionedTemplate = generateTemplateVersion(
              context,
              templateInstance,
              versions,
              context.token.id,
              comment,
              visibility as TemplateVisibility,
              TemplateVersionType[versionType]
            );

            // If the versionedTemplate is not null then the versioning process succeeded
            if (versionedTemplate) {
              // Reload the template and return it.
              return await Template.findById(reference, context, templateId);
            }

            throw InternalServerError();
          }
          throw ForbiddenError();
        }
        throw NotFoundError();
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
  },

  Template: {
    // Chained resolver to fetch the Affiliation info for the user
    owner: async (parent: Template, _, context: MyContext): Promise<Affiliation> => {
      return await Affiliation.findByURI('Chained Template.owner', context, parent.ownerId);
    },

    // Chained resolver to fetch the TemplateCollaborators
    collaborators: async (parent: Template, _, context: MyContext): Promise<TemplateCollaborator[]> => {
      return await TemplateCollaborator.findByTemplateId('Chained Template.collaborators', context, parent.id);
    },

    // Allow the GraphQL client to fetch the template when querying for a Section
    sections: async (parent: Template, _, context: MyContext): Promise<Section[]> => {
      return await Section.findByTemplateId('Chained Template.sections', context, parent.id);
    }
  },
};
