import { Resolvers } from "../types";
import { Template, TemplateSearchResult, TemplateVisibility } from "../models/Template";
import { Affiliation } from "../models/Affiliation";
import { TemplateCollaborator } from "../models/Collaborator";
import { Section } from "../models/Section";
import { VersionedSection } from '../models/VersionedSection';
import { VersionedQuestion } from "../models/VersionedQuestion";
import { User, UserRole } from '../models/User';
import { MyContext } from "../context";
import { cloneTemplate, generateTemplateVersion, hasPermissionOnTemplate } from "../services/templateService";
import { cloneSection } from "../services/sectionService";
import { cloneQuestion } from "../services/questionService";
import { isAdmin, isSuperAdmin } from "../services/authService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { VersionedTemplate, TemplateVersionType } from "../models/VersionedTemplate";
import { formatLogMessage } from "../logger";
import { GraphQLError } from "graphql";

export const resolvers: Resolvers = {
  Query: {
    // Get the Templates that belong to the current user's affiliation (user must be an Admin)
    myTemplates: async (_, __, context: MyContext): Promise<TemplateSearchResult[]> => {
      const reference = 'myTemplates resolver';
      try {
        if (isAdmin(context.token)) {
          return await TemplateSearchResult.findByAffiliationId(reference, context, context.token.affiliationId);
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Get the specified Template (user must be an Admin)
    //    - called by the Template Overview page
    template: async (_, { templateId }, context: MyContext): Promise<Template> => {
      const reference = 'template resolver';
      try {
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);
          if (template) {
            // Verify that the current user has permission to access the Template
            if (await hasPermissionOnTemplate(context, template)) {
              return template;
            }
            throw ForbiddenError();
          }
          throw NotFoundError();
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Mutation: {
    // Add a new template by copying an existing one or starting from scratch (copyFromTemplateId left blank).
    //    - called by the Template Builder - prior template selection page AND the initial page
    addTemplate: async (_, { name, copyFromTemplateId }, context: MyContext): Promise<Template> => {
      const reference = 'addTemplate resolver';
      try {
        if (isAdmin(context.token)) {
          let template: Template;
          if (copyFromTemplateId) {
            // Fetch the VersionedTemplate we are cloning
            const original = await VersionedTemplate.findVersionedTemplateById(reference, context, copyFromTemplateId);
            template = cloneTemplate(context.token?.id, context.token.affiliationId, original);
            template.name = name;
          }
          if (!template) {
            // Create a new blank template
            template = new Template({ name, ownerId: context.token.affiliationId });
          }

          // Create new template
          const newTemplate = await template.create(context);
          const templateId = newTemplate.id;

          // Add generic error
          if (!newTemplate || newTemplate.hasErrors()) {
            template.addError('general', 'Unable to create Template');
          }

          if (templateId && copyFromTemplateId && !newTemplate.hasErrors()) {
            // Fetch and copy versionedSections to sections table for new template
            const versionedSections = await VersionedSection.findByTemplateId(reference, context, copyFromTemplateId);
            for (const versionedSection of versionedSections) {
              const versionedSectionId = versionedSection.sectionId;
              const section = cloneSection(context.token?.id, templateId, versionedSection)
              if (section && !section.hasErrors()) {
                const newSection = await section.create(context, templateId);
                const sectionId = newSection.id;

                //Fetch and copy all related versionedQuestions to copy to questions table for new template
                const versionedQuestions = await VersionedQuestion.findByVersionedSectionId(
                  reference,
                  context,
                  versionedSectionId
                );
                for (const versionedQuestion of versionedQuestions) {
                  const question = await cloneQuestion(context.token?.id, templateId, sectionId, versionedQuestion);
                  if (question) {
                    const newQuestion = await question.create(context);
                    if (newQuestion && newQuestion.hasErrors()) {
                      formatLogMessage(context).error(`Failed to clone question ${question.id}`);
                      newTemplate.addError('questions', 'Created Template but unable to clone all questions');
                    }
                  }
                }
              } else {
                formatLogMessage(context).error(`Failed to clone section ${versionedSectionId}`);
                newTemplate.addError('sections', 'Created Template but unable to clone all sections');
              }
            }
          }


          return newTemplate;
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Update the specified template
    //    - called by the Template options page
    updateTemplate: async (_, { templateId, name, visibility, bestPractice }, context: MyContext): Promise<Template> => {
      const reference = 'updateTemplate resolver';
      try {
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);

          // Need to create an instance of template in order to access the "update" method below
          const templateInstance = new Template({ ...template });

          // Only allow the bestPractice flag to be changed if the user is a Super admin!
          templateInstance.bestPractice = isSuperAdmin(context.token) ? bestPractice : template.bestPractice;

          if (templateInstance) {
            if (await hasPermissionOnTemplate(context, template)) {
              // Update the fields and then save
              templateInstance.name = name;
              templateInstance.visibility = TemplateVisibility[visibility];
              const updated = await templateInstance.update(context);
              if (!updated || updated.hasErrors()) {
                updated?.addError('general', 'Unable to update Template');
              }

              return updated.hasErrors() ? updated : Template.findById(reference, context, templateId);
            }
          }
          throw NotFoundError();
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Unpublish the template.
    //    - called by the Template options page
    archiveTemplate: async (_, { templateId }, context: MyContext): Promise<Template> => {
      const reference = 'archiveTemplate resolver';
      try {
        if (isAdmin(context.token)) {
          // TODO: Once we have plans and overlays in place, update this so that it does not
          //       get deleted and orphan those records but instead just unpublishes and sets a flag

          const template = await Template.findById(reference, context, templateId);
          // Need to create an instance of template in order to access the "delete" method below
          const templateInstance = new Template({ ...template });

          if (templateInstance) {
            if (await hasPermissionOnTemplate(context, template)) {
              const deleted = await templateInstance.delete(context);
              if (!deleted) {
                templateInstance.addError('general', 'Unable to delete Template');
              }
              return templateInstance;
            }
          }
          throw NotFoundError();
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Publish the template or save as a draft
    //     - called from the Template overview page
    createTemplateVersion: async (_, { templateId, comment, versionType, visibility }, context: MyContext): Promise<Template> => {
      const reference = 'createTemplateVersion resolver';
      try {
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);
          // Need to create an instance of template in order to access the "update" method below
          const templateInstance = new Template({ ...template });

          if (templateInstance) {
            if (await hasPermissionOnTemplate(context, template)) {
              const versions = await VersionedTemplate.findByTemplateId(reference, context, templateId);

              let versionedTemplate: VersionedTemplate | null = null;
              try {
                versionedTemplate = await generateTemplateVersion(
                  context,
                  templateInstance,
                  versions,
                  context.token.id,
                  comment,
                  visibility as TemplateVisibility,
                  TemplateVersionType[versionType]
                );
              } catch (err) {
                templateInstance.addError('general', err.message);
                return templateInstance;
              }

              // If the versionedTemplate is not null then the versioning process succeeded
              if (versionedTemplate && !versionedTemplate.hasErrors()) {
                // Reload the template and return it.
                return await Template.findById(reference, context, templateId);
              }

              // Add generic error
              templateInstance.addError('general', 'Unable to version the Template');
              return templateInstance;
            }
          }
          throw NotFoundError();
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference} `);
        throw InternalServerError();
      }
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
    },

    // Chained resolver to fetch the admins associated with the template's owner
    admins: async (parent: Template, _, context: MyContext): Promise<User[]> => {
      const results = await User.findByAffiliationId('Chained Template.admins', context, parent.ownerId);
      return results.filter((user) => user.role === UserRole.ADMIN);

    }
  },
};
