import {CollaboratorSearchResult, Resolvers} from "../types";
import {
  TemplateCollaborator,
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel
} from "../models/Collaborator";
import { User } from '../models/User';
import { MyContext } from "../context";
import { Template } from "../models/Template";
import { Project } from "../models/Project";
import {isAdmin, isAuthorized, isSuperAdmin} from "../services/authService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { hasPermissionOnTemplate } from "../services/templateService";
import { hasPermissionOnProject } from "../services/projectService";
import { sendProjectCollaborationEmail } from '../services/emailService';
import { prepareObjectForLogs } from "../logger";
import { GraphQLError } from "graphql";
import { isNullOrUndefined, normaliseDateTime, ORCID_REGEX } from "../utils/helpers";
import { Affiliation } from "../models/Affiliation";
import { PaginatedQueryResults } from "../types/general";
import {
  findCollaboratorByAffiliationAndTerm,
  findCollaboratorByOrcid
} from "../services/collaboratorService";

export const resolvers: Resolvers = {
  Query: {
    // Get all of the Users that belong to another affiliation that can edit the Template
    //     - called from the Template options page
    templateCollaborators: async (_, { templateId }, context: MyContext): Promise<TemplateCollaborator[]> => {
      const reference = 'templateCollaborators resolver';
      try {
        // if the user is an admin
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);
          if (isNullOrUndefined(template)){
            throw NotFoundError();
          }

          // If the user has permission on the Template
          if (template && await hasPermissionOnTemplate(context, template)) {
            const results = await TemplateCollaborator.findByTemplateId(reference, context, templateId);
            return results;
          }
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    projectCollaborators: async (_, { projectId }, context: MyContext): Promise<ProjectCollaborator[]> => {
      const reference = 'projectCollaborators resolver';
      try {
        const project = await Project.findById(reference, context, projectId);
        if (isNullOrUndefined(project)) {
          throw NotFoundError();
        }

        // If the user has permission on the Template
        if (project && await hasPermissionOnProject(context, project, ProjectCollaboratorAccessLevel.COMMENT)) {
          const results = await ProjectCollaborator.findByProjectId(reference, context, projectId);
          return results;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    findCollaborator: async (_, { term }, context: MyContext): Promise<CollaboratorSearchResult[]> => {
      const reference = 'userByOrcid resolver';
      try {
        if (isAuthorized(context.token)) {
          if (!isNullOrUndefined(term) && term.length > 3) {
            // If the incoming term is an ORCID then search by that
            if (term.match(ORCID_REGEX)) {
              const person: CollaboratorSearchResult = await findCollaboratorByOrcid(
                reference,
                context,
                term
              );
              return isNullOrUndefined(person) ? [] : [person];
            }

            let users: PaginatedQueryResults<User>;

            // If the user is a super admin then search all users
            if (isSuperAdmin(context.token)) {
              users = await User.search(reference, context, term);
            } else {
              // Otherwise just search the current user's affiliation
              users = await User.findByAffiliationId(
                reference,
                context,
                context.token?.affiliationId,
                term
              );
            }

            // Convert everything from a User to a CollaboratorSearchResult
            const results: CollaboratorSearchResult[] = await Promise.all(users.items.map(async (user) => {
              const affiliation = await Affiliation.findByURI(
                reference,
                context,
                user.affiliationId
              );

              return {
                givenName: user.givenName,
                surName: user.surName,
                orcid: user.orcid || '',
                email: await user.getEmail(context),
                affiliationName: affiliation?.name,
                affiliationId: affiliation?.homepage,
                affiliationRORId: user.affiliationId,
              }
            }));

            const collaborators = await findCollaboratorByAffiliationAndTerm(
              reference,
              context,
              term
            );
            collaborators.forEach(c => {
              if (!results.find(r => r.email === c.email || r.orcid === c.orcid)) {
                results.push(c);
              }
            });
            return results;
          }
        }
        // Unauthorized!
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    }
  },

  Mutation: {
    // Add a collaborator to a Template
    //     - called from the Template options page
    addTemplateCollaborator: async (_, { templateId, email }, context: MyContext): Promise<TemplateCollaborator> => {
      const reference = 'addTemplateCollaborator resolver';
      try {
        // if the user is an admin
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);
          // The template doesn't exist
          if (isNullOrUndefined(template)) {
            throw NotFoundError();
          }

          // If the user has permission on the Template
          if (await hasPermissionOnTemplate(context, template)) {
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
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // Remove a TemplateCollaborator from a Template
    //     - called from the Template options page
    removeTemplateCollaborator: async (_, { templateId, email }, context: MyContext): Promise<TemplateCollaborator> => {
      const reference = 'removeTemplateCollaborator resolver';
      try {
        // if the user is an admin
        if (isAdmin(context.token)) {
          const template = await Template.findById(reference, context, templateId);
          if (isNullOrUndefined(template)) {
            throw NotFoundError();
          }

          // If the user has permission on the Template
          if (template && await hasPermissionOnTemplate(context, template)) {
            const collaborator = await TemplateCollaborator.findByTemplateIdAndEmail(reference, context, templateId, email);
            if (collaborator) {
              return await collaborator.delete(context);
            }
          }
        }
        // Unauthorized! or Forbidden
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Add a collaborator to a Project
    addProjectCollaborator: async (_, { projectId, email, accessLevel }, context: MyContext): Promise<ProjectCollaborator> => {
      const reference = 'addProjectCollaborator resolver';
      try {

        const project = await Project.findById(reference, context, projectId);

        // The project doesn't exist
        if (!project) {
          throw NotFoundError();
        }

        // If the user has permission on the Project
        if (await hasPermissionOnProject(context, project)) {
          const invitedById = context.token?.id;
          const projectCollaborator = new ProjectCollaborator({ projectId, email, accessLevel, invitedById });
          const created = await projectCollaborator.create(context);

          if (created?.id) {
            return created;
          }

          // A null was returned so add a generic error and return it
          if (!projectCollaborator.errors['general']) {
            projectCollaborator.addError('general', 'Unable to create Project collaborator');
          }
          return projectCollaborator;

        }
        // Unauthorized! or Forbidden
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Add a collaborator to a Project
    updateProjectCollaborator: async (_, { projectCollaboratorId, accessLevel }, context: MyContext): Promise<ProjectCollaborator> => {
      const reference = 'updateProjectCollaborator resolver';
      try {
        const projectCollaborator = await ProjectCollaborator.findById(reference, context, projectCollaboratorId);

        // The projectCollaborator doesn't exist
        if (!projectCollaborator) {
          throw NotFoundError();
        }

        // Get project info to check permissions
        const project = await Project.findById(reference, context, projectCollaborator.projectId);

        // If the user has permission on the Project
        if (await hasPermissionOnProject(context, project)) {
          const newProjectCollaborator = new ProjectCollaborator({
            ...projectCollaborator,
            accessLevel: accessLevel
          });

          const updatedProjectCollaborator = await newProjectCollaborator.update(context);

          if (updatedProjectCollaborator?.id) {
            return updatedProjectCollaborator;
          }

          // A null was returned so add a generic error and return it
          if (!projectCollaborator.errors['general']) {
            projectCollaborator.addError('general', 'Unable to create Project collaborator');
          }
          return projectCollaborator;
        }

        // Unauthorized! or Forbidden
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Remove a ProjectCollaborator from a Project
    removeProjectCollaborator: async (_, { projectCollaboratorId }, context: MyContext): Promise<ProjectCollaborator> => {
      const reference = 'removeProjectCollaborator resolver';
      try {

        const projectCollaborator = await ProjectCollaborator.findById(reference, context, projectCollaboratorId);

        // The projectCollaborator doesn't exist
        if (!projectCollaborator) {
          throw NotFoundError();
        }

        // Get project info to check permissions
        const project = await Project.findById(reference, context, projectCollaborator.projectId);

        // If the user has permission on the Project
        if (await hasPermissionOnProject(context, project)) {
          return await projectCollaborator.delete(context);
        }

        // Unauthorized! or Forbidden
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
    // Resend invite to collaborator
    resendInviteToProjectCollaborator: async (_, { projectCollaboratorId }, context: MyContext): Promise<ProjectCollaborator> => {
      const reference = 'resendInviteToProjectCollaborator resolver';

      try {
        const projectCollaborator = await ProjectCollaborator.findById(reference, context, projectCollaboratorId);

        // The projectCollaborator doesn't exist
        if (!projectCollaborator) {
          throw NotFoundError();
        }

        // Get project info to check permissions
        const project = await Project.findById(reference, context, projectCollaborator.projectId);

        // If the user has permission on the Project
        if (await hasPermissionOnProject(context, project)) {
          const inviter = await User.findById(reference, context, context.token?.id);

          // Send out the invitation notification (no async here, can happen in the background)
          await sendProjectCollaborationEmail(context, project.title, inviter.getName(), projectCollaborator.email, projectCollaborator.userId);

          return projectCollaborator;
        }

        // Unauthorized! or Forbidden
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        context.logger.error(prepareObjectForLogs(err), `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  ProjectCollaborator: {
    // Chained resolver to fetch the User record
    user: async (parent: ProjectCollaborator, _, context: MyContext): Promise<User> => {
      if (!isNullOrUndefined(parent?.userId)) {
        return await User.findById('Chained TemplateController.user', context, parent.userId);
      }
    },

    invitedBy: async (parent: ProjectCollaborator, _, context: MyContext): Promise<User> => {
      if (!isNullOrUndefined(parent?.invitedById)) {
        return await User.findById(
          'Chained ProjectCollaborator.invitedBy',
          context,
          parent.invitedById
        );
      }
    },

    created: (parent: ProjectCollaborator) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: ProjectCollaborator) => {
      return normaliseDateTime(parent.modified);
    }
  },

  TemplateCollaborator: {
    // Chained resolver to fetch the Template info
    template: async (parent: TemplateCollaborator, _, context: MyContext): Promise<Template> => {
      if (!isNullOrUndefined(parent?.templateId)) {
        return await Template.findById(
          'Chained TemplateCollaborator.template',
          context,
          parent.templateId
        );
      }
    },

    // Chained resolver to fetch the Affiliation info for the user
    invitedBy: async (parent: TemplateCollaborator, _, context: MyContext): Promise<User> => {
      return await User.findById('Chained TemplateCollaborator.invitedBy', context, parent.invitedById);
    },

    // Chained resolver to fetch the User record
    user: async (parent: TemplateCollaborator, _, context: MyContext): Promise<User> => {
      if (!isNullOrUndefined(parent?.userId)) {
        return await User.findById('Chained TemplateController.user', context, parent.userId);
      }
    },

    created: (parent: TemplateCollaborator) => {
      return normaliseDateTime(parent.created);
    },
    modified: (parent: TemplateCollaborator) => {
      return normaliseDateTime(parent.modified);
    }
  },
};
