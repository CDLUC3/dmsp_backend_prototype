import { Affiliation as AffiliationGQL, Resolvers, Section as SectionGQL, TemplateSearchResults } from "../types.js";
import { Template, TemplateSearchResult, TemplateVisibility } from "../models/Template.js";
import { Affiliation } from "../models/Affiliation.js";
import { TemplateCollaborator } from "../models/Collaborator.js";
import { Section } from "../models/Section.js";
import { Question } from "../models/Question.js";
import { VersionedSection } from '../models/VersionedSection.js';
import { VersionedQuestion } from "../models/VersionedQuestion.js";
import { User, UserRole } from '../models/User.js';
import { Tag } from "../models/Tag.js";
import { MyContext } from "../context.js";
import {
  cloneTemplate,
  generateTemplateVersion,
  hasPermissionOnTemplate,
  setDefaultTemplate
} from "../services/templateService.js";
import { cloneSection } from "../services/sectionService.js";
import { cloneQuestion } from "../services/questionService.js";
import { isAdmin, isSuperAdmin } from "../services/authService.js";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors.js";
import { VersionedTemplate, TemplateVersionType } from "../models/VersionedTemplate.js";
import { prepareObjectForLogs } from "../logger.js";
import { GraphQLError } from "graphql";
import { generalConfig } from "../config/generalConfig.js";
import { PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from "../types/general.js";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";
import {
  handleFunderTemplateArchive
} from "../services/templateCustomizationService.js";
import { AdminNotification } from "../models/AdminNotifications.js";

export const resolvers: Resolvers = {
  Query: {
    // Get the Templates that belong to the current user's affiliation (user must be an Admin)
    myTemplates: async (_, { term, paginationOptions }, context: MyContext): Promise<TemplateSearchResults> => {
      const reference = 'myTemplates resolver';
      try {
        if (isAdmin(context.token)) {
          const opts = !isNullOrUndefined(paginationOptions) && paginationOptions.type === PaginationType.OFFSET
            ? paginationOptions as PaginationOptionsForOffsets
            : { ...paginationOptions, type: PaginationType.CURSOR } as PaginationOptionsForCursors;

          return await TemplateSearchResult.findByAffiliationIdAndTerm(
            reference,
            context,
            context.token.affiliationId,
            term ?? '',
            opts,
          );
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
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

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Mutation: {
    // Add a new template by copying an existing one or starting from scratch.
    //    - copyFromTemplateId: Copy from working template (must be owned by admin)
    //    - copyFromVersionedTemplateId: Copy from published version (any published template)
    //    - called by the Template Builder - prior template selection page AND the initial page
    addTemplate: async (_, { name, copyFromTemplateId, copyFromVersionedTemplateId }, context: MyContext): Promise<Template> => {
      const reference = 'addTemplate resolver';
      try {
        if (isAdmin(context.token)) {
          let template: Template | undefined;
          let adminOwnsTemplate = false;
          let sourceTemplateId: number | undefined;

          // Validate that only one copy source is provided
          if (copyFromTemplateId && copyFromVersionedTemplateId) {
            template = new Template({ name, ownerId: context.token.affiliationId });
            template.addError('general', 'Cannot specify both copyFromTemplateId and copyFromVersionedTemplateId');
            return template;
          }

          if (copyFromTemplateId) {
            // Copy from a working template (must be owned by admin)
            const originalTemplate = await Template.findById(reference, context, copyFromTemplateId);

            if (originalTemplate) {
              // Check if the admin owns this template
              if (originalTemplate.ownerId === context.token.affiliationId) {
                adminOwnsTemplate = true;
                sourceTemplateId = copyFromTemplateId;
                template = cloneTemplate(context.token?.id, context.token.affiliationId, originalTemplate);
                template.name = name;
                template.sourceTemplateId = copyFromTemplateId;
                template.sourceVersionedTemplateId = undefined;
              }
            } else {
              // Template not found
              template = new Template({ name, ownerId: context.token.affiliationId });
              template.addError('general', 'Template not found');
              return template;
            }
          } else if (copyFromVersionedTemplateId) {
            // Copy from a published versioned template (any published template)
            const versionedTemplate = await VersionedTemplate.findById(reference, context, copyFromVersionedTemplateId);

            if (versionedTemplate) {
              adminOwnsTemplate = false; // Always copy from versioned tables
              template = cloneTemplate(context.token?.id, context.token.affiliationId, versionedTemplate);
              template.name = name;
              template.sourceTemplateId = undefined;
              template.sourceVersionedTemplateId = copyFromVersionedTemplateId;
            } else {
              // Versioned template not found
              template = new Template({ name, ownerId: context.token.affiliationId });
              template.addError('general', 'Published template version not found');
              return template;
            }
          }

          if (!template) {
            // Create a new blank template
            template = new Template({ name, ownerId: context.token.affiliationId });
          }

          // Create new template
          const newTemplate = await template.create(context);
          if (isNullOrUndefined(newTemplate)) {
            template.addError('general', 'Unable to create Template');
            return template;
          }

          // Notify all org admins of the new template
          if (newTemplate.id) {
            await AdminNotification.addNotificationForAffiliation(
              reference,
              context,
              context.token.affiliationId,
              'TEMPLATE_CREATED',
              { templateId: newTemplate.id },
            );
          }


          const templateId = newTemplate.id;

          // Add generic error
          if (newTemplate.hasErrors()) {
            template.addError('general', 'Unable to create Template');
          }

          if (templateId && (copyFromTemplateId || copyFromVersionedTemplateId) && !newTemplate.hasErrors()) {
            if (adminOwnsTemplate && !isNullOrUndefined(sourceTemplateId)) {
              // Copy from working tables (templates, sections, questions)
              const sections = await Section.findByTemplateId(reference, context, sourceTemplateId);

              for (const section of sections) {
                const sectionId = section.id;
                if (isNullOrUndefined(sectionId)) {
                  continue;
                }
                const newSection = cloneSection(context.token?.id, templateId, section);
                if (newSection && !newSection.hasErrors()) {
                  const createdSection = await newSection.create(context, templateId);
                  if (isNullOrUndefined(createdSection) || isNullOrUndefined(createdSection.id)) {
                    context.logger.error(`${reference} failed to clone section`);
                    newTemplate.addError('sections', 'Created Template but unable to clone all sections');
                    continue;
                  }
                  const createdSectionId = createdSection.id;

                  // Fetch and copy all related questions from questions table
                  const questions = await Question.findBySectionId(reference, context, sectionId);

                  for (const q of questions) {
                    if (isNullOrUndefined(q.id)) {
                      continue;
                    }
                    const question = cloneQuestion(context.token?.id, templateId, createdSectionId, q);
                    if (question) {
                      const newQuestion = await question.create(context);
                      if (newQuestion && newQuestion.hasErrors()) {
                        context.logger.error(`${reference} failed to clone question`);
                        newTemplate.addError('questions', 'Created Template but unable to clone all questions');
                      } else if (newQuestion?.id) {
                        // Get tags that belong to the source question, so we can copy them onto the clone
                        const sourceTags = await Tag.findByQuestionId(reference, context, q.id);

                        for (const tag of sourceTags) {
                          const wasAdded = await tag.addToQuestion(context, newQuestion.id);
                          if (!wasAdded) {
                            context.logger.error(`${reference} failed to copy tag ${tag.id} to cloned question ${newQuestion.id}`);
                            newTemplate.addError('questions', 'Created Template but unable to clone all question tags');
                          }
                        }
                      }
                    }
                  }
                } else {
                  context.logger.error(`${reference} failed to clone section`);
                  newTemplate.addError('sections', 'Created Template but unable to clone all sections');
                }
              }
            } else if (!adminOwnsTemplate && !isNullOrUndefined(copyFromVersionedTemplateId)) {
              // Copy from published/versioned tables (versionedTemplates, versionedSections, versionedQuestions)
              const versionedSections = await VersionedSection.findByTemplateId(reference, context, copyFromVersionedTemplateId);

              for (const versionedSection of versionedSections) {
                const versionedSectionId = versionedSection.id;
                if (isNullOrUndefined(versionedSectionId)) {
                  continue;
                }
                const section = cloneSection(context.token?.id, templateId, versionedSection);
                if (section && !section.hasErrors()) {
                  const newSection = await section.create(context, templateId);
                  if (isNullOrUndefined(newSection) || isNullOrUndefined(newSection.id)) {
                    context.logger.error(`${reference} failed to clone section`);
                    newTemplate.addError('sections', 'Created Template but unable to clone all sections');
                    continue;
                  }
                  const sectionId = newSection.id;

                  // Fetch and copy all related versionedQuestions to questions table
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
                        context.logger.error(`${reference} failed to clone question`);
                        newTemplate.addError('questions', 'Created Template but unable to clone all questions');
                      }
                    }
                  }
                } else {
                  context.logger.error(`${reference} failed to clone section`);
                  newTemplate.addError('sections', 'Created Template but unable to clone all sections');
                }
              }
            }
          }

          return newTemplate;
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Mark the specified template as the default
    markAsDefaultTemplate: async (_, { templateId }, context: MyContext): Promise<Template> => {
      const reference = 'markAsDefaultTemplate resolver';
      try {
        if (isSuperAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);
          if (!template) {
            throw NotFoundError('Template does not exist');
          }

          if (await setDefaultTemplate(reference, context, template)) {
            // Refetch the updated template and return it
            const refetched = await Template.findById(reference, context, templateId);
            if (isNullOrUndefined(refetched)) {
              throw NotFoundError('Template does not exist');
            }
            return refetched;
          } else {
            template.addError('general', 'Unable to mark the template as the default');
          }
          return template
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Update the specified template
    //    - called by the Template options page
    updateTemplate: async (_, { templateId, name, bestPractice }, context: MyContext): Promise<Template> => {
      const reference = 'updateTemplate resolver';
      try {
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);
          if (isNullOrUndefined(template)) {
            throw NotFoundError();
          }

          // Need to create an instance of template in order to access the "update" method below
          const templateInstance = new Template({ ...template });

          // Only allow the bestPractice flag to be changed if the user is a Super admin!
          templateInstance.bestPractice = isSuperAdmin(context.token) && !isNullOrUndefined(bestPractice)
            ? bestPractice
            : template.bestPractice;

          if (templateInstance) {
            if (await hasPermissionOnTemplate(context, template)) {
              // Update the fields and then save
              templateInstance.name = name;
              const updated = await templateInstance.update(context);
              if (isNullOrUndefined(updated)) {
                template.addError('general', 'Unable to update Template');
                throw NotFoundError();
              }
              if (updated.hasErrors()) {
                return updated;
              }

              const refetched = await Template.findById(reference, context, templateId);
              if (isNullOrUndefined(refetched)) {
                throw NotFoundError();
              }
              return refetched;
            }
          }
          throw NotFoundError();
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Unpublish the template.
    //    - called by the Template options page
    archiveTemplate: async (_, { templateId }, context: MyContext): Promise<Template> => {
      const reference = 'archiveTemplate resolver';
      try {
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);

          if (template) {
            // Need to create an instance of template in order to access the "update" or "delete" method below
            const templateInstance = new Template({ ...template });

            if (await hasPermissionOnTemplate(context, template)) {
              // Check if there are any plans associated with any versionedTemplate for this template
              const hasPlans = await VersionedTemplate.hasAssociatedPlans(reference, context, templateId);

              // Mark all customizations as ORPHANED since the template is being archived
              const nbrCustomizations = await handleFunderTemplateArchive(
                reference,
                context,
                templateId
              )

              // If the template has associated plans or customizations then we cannot delete it!
              if (hasPlans || nbrCustomizations > 0) {
                // Template has associated plans, so unpublish it instead of deleting
                templateInstance.latestPublishVersion = undefined;
                templateInstance.latestPublishDate = undefined;
                templateInstance.isDirty = true;

                const updated = await templateInstance.update(context);
                if (isNullOrUndefined(updated)) {
                  templateInstance.addError('general', 'Unable to unpublish Template');
                  return templateInstance;
                }
                if (updated.hasErrors()) {
                  updated.addError('general', 'Unable to unpublish Template');
                }

                // Set all related versionedTemplates to inactive
                if (!updated.hasErrors()) {
                  await VersionedTemplate.deactivateByTemplateId(reference, context, templateId);
                }

                return updated;
              } else {
                // No plans associated, safe to delete the template
                const deleted = await templateInstance.delete(context);
                if (!deleted) {
                  templateInstance.addError('general', 'Unable to delete Template');
                }
                return templateInstance;
              }
            }
          }
          throw NotFoundError();
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Publish the template or save as a draft
    //     - called from the Template overview page
    createTemplateVersion: async (_, { templateId, comment, versionType, latestPublishVisibility }, context: MyContext): Promise<Template> => {
      const reference = 'createTemplateVersion resolver';
      try {
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);
          if (isNullOrUndefined(template)) {
            throw NotFoundError();
          }
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
                  comment ?? undefined,
                  latestPublishVisibility as TemplateVisibility,
                  versionType ? TemplateVersionType[versionType] : undefined
                );
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Unable to version the Template';
                templateInstance.addError('general', message);
                return templateInstance;
              }

              // If the versionedTemplate is not null then the versioning process succeeded
              if (versionedTemplate && !versionedTemplate.hasErrors()) {
                // Reload the template and return it.
                const refetched = await Template.findById(reference, context, templateId);
                if (isNullOrUndefined(refetched)) {
                  throw NotFoundError();
                }
                return refetched;
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

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  // NOTE: `parent` below is typed to the GraphQL-facing shape, but at runtime it is actually
  // the model instance returned by the parent resolver, so it's cast back via `as unknown as X`.
  TemplateSearchResult: {
    // Resolver for ownerDisplayName based on owner.displayName
    ownerDisplayName: async (parent, _, context: MyContext) => {
      const model = parent as unknown as TemplateSearchResult;
      if (model.ownerId) {
        const owner = await Affiliation.findByURI('TemplateSearchResult.owner', context, model.ownerId);
        return owner?.displayName || null;
      }
      return null;
    },
  },

  Template: {
    // Chained resolver to fetch the Affiliation info for the user
    owner: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Template;
      if (model.ownerId) {
        const affiliation = await Affiliation.findByURI('Chained Template.owner', context, model.ownerId);
        return affiliation ? (affiliation as unknown as AffiliationGQL) : null;
      }
      return null;
    },

    // Chained resolver to fetch the TemplateCollaborators
    collaborators: async (parent, _, context: MyContext): Promise<TemplateCollaborator[]> => {
      const model = parent as unknown as Template;
      if (model.id) {
        return await TemplateCollaborator.findByTemplateId('Chained Template.collaborators', context, model.id);
      }
      return [];
    },

    // Allow the GraphQL client to fetch the template when querying for a Section
    sections: async (parent, _, context: MyContext) => {
      const model = parent as unknown as Template;
      if (model.id) {
        const sections = await Section.findByTemplateId('Chained Template.sections', context, model.id);
        // The Section model's `tags` field (via models/Tag.js) isn't perfectly structurally
        // identical to the generated GraphQL `Tag` type (e.g. `slug` is required there), so
        // bridge it the same way the parent cast above does.
        return sections as unknown as SectionGQL[];
      }
      return [];
    },

    // Chained resolver to fetch the admins associated with the template's owner
    admins: async (parent, _, context: MyContext): Promise<User[]> => {
      const model = parent as unknown as Template;
      if (model.ownerId) {
        const opts = { type: PaginationType.CURSOR, cursor: undefined, limit: generalConfig.maximumSearchLimit };
        const results = await User.findByAffiliationId('Chained Template.admins', context, model.ownerId, '', opts);
        return Array.isArray(results.items) ? results.items.filter((user) => user.role === UserRole.ADMIN) : [];
      }
      return [];
    },

    created: (parent) => {
      const model = parent as unknown as Template;
      return normaliseDateTime(model.created);
    },
    modified: (parent) => {
      const model = parent as unknown as Template;
      return normaliseDateTime(model.modified);
    }
  },
};
