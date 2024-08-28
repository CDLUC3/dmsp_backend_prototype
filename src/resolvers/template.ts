import { Resolvers } from "../types";
import { Template, TemplateVisibility } from "../models/Template";
import { MyContext } from "../context";
import { Affiliation } from "../models/Affiliation";
import { TemplateCollaborator } from "../models/Collaborator";
import { clone, generateVersion, hasPermission } from "../services/templateService";
import { isAdmin } from "../services/authService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { VersionedTemplate, TemplateVersionType } from "../models/VersionedTemplate";

export const resolvers: Resolvers = {
  Query: {
    // Get the Templates that belong to the current user's affiliation (user must be an Admin)
    templates: async (_, __, context: MyContext): Promise<Template[]> => {
      if (isAdmin(context.token)){
        return await Template.findByUser('templates resolver', context);
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    // Get the specified Template (user must be an Admin)
    //    - called by the Template Overview page
    template: async (_, { templateId }, context: MyContext): Promise<Template> => {
      if (isAdmin(context.token)){
        const template = await Template.findById('template resolver', context, templateId);
        if (template) {
          // Verify that the current user has permission to access the Template
          if (hasPermission(context, template)) {
            return template;
          }
          throw ForbiddenError();
        }
        throw NotFoundError();
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
  },

  Mutation: {
    // Add a new template by copying an existing one or starting from scratch (copyFromTemplateId left blank).
    //    - called by the Template Builder - prior template selection page AND the initial page
    addTemplate: async (_, { name, copyFromTemplateId }, context: MyContext): Promise<Template> => {
      if (isAdmin(context.token)){
        let template;
        if (copyFromTemplateId) {
          // Fetch the VersionedTemplate we are cloning
          const original = await VersionedTemplate.findPublishedTemplateById(
            'addTemplate resolver',
            context,
            copyFromTemplateId
          );
          template = await clone(context.token?.id, context.token.affiliationId, original);
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
    updateTemplate: async (_, { templateId, name, visibility }, context: MyContext): Promise<Template> => {
      if (isAdmin(context.token)){
        const template = await Template.findById('updateTemplate resolver', context, templateId);
        if (template) {
          if (hasPermission(context, template)) {
            // Update the fields and then save
            template.name = name;
            template.visibility = TemplateVisibility[visibility];
            return await template.update(context);
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
      if (isAdmin(context.token)){
        // TODO: Once we have plans and overlays in place, update this so that it does not
        //       get deleted and orphan those records but instead just unpublishes and sets a flag

        const template = await Template.findById('archiveTemplate resolver', context, templateId);
        if (template) {
          if (hasPermission(context, template)) {
            return await template.delete(context);
          }
          throw ForbiddenError();
        }
        throw NotFoundError();
      }
      return false;
    },

    // Publish the template or save as a draft
    //     - called from the Template overview page
    createVersion: async (_, { templateId, comment, versionType }, context: MyContext): Promise<Template> => {
      if (isAdmin(context.token)){
        const reference = 'createVersion resolver';
        const template = await Template.findById(reference, context, templateId);
        if (template) {
          if (hasPermission(context, template)) {
            const versions = await VersionedTemplate.findByTemplateId(reference, context, templateId);

            const versionedTemplate = await generateVersion(
              template,
              versions,
              context.token.id,
              comment,
              TemplateVersionType[versionType]
            );

            if (versionedTemplate) {
              // Save the new VersionedTemplate
              versionedTemplate.create(context);

              // Deactivate the old versions
              versions.forEach((prior) => {
                prior.active = false;
                prior.update(context);
              });

              // Bump the version number, and clear the isDirty flag and then save
              template.currentVersion = versionedTemplate.version;
              template.isDirty = false;
              return template.update(context);
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
      return await Affiliation.findById('Chained Template.owner', context, parent.ownerId);
    },

    // Chained resolver to fetch the TemplateCollaborators
    collaborators: async (parent: Template, _, context: MyContext): Promise<TemplateCollaborator[]> => {
      return await TemplateCollaborator.findByTemplateId('Chained Template.collaborators', context, parent.id);
    },
  },
};
