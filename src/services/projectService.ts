import { MyContext } from "../context";
import { prepareObjectForLogs } from "../logger";
import { ProjectCollaborator, ProjectCollaboratorAccessLevel } from "../models/Collaborator";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { isAdmin, isSuperAdmin } from "./authService";
import {isNullOrUndefined} from "../utils/helpers";
import {ProjectMember} from "../models/Member";
import {MemberRole} from "../models/MemberRole";

// Determine whether the specified user has permission to access the Section
export const hasPermissionOnProject = async (
  context: MyContext,
  project: Project,
  requiredAccessLevel = ProjectCollaboratorAccessLevel.EDIT,
): Promise<boolean> => {
  const reference = 'projectService.hasPermissionOnProject';
  if (!context || !context.token) return false;

  // Super admins always have permission
  if (await isSuperAdmin(context.token)) {
    return true;
  }

  if (project && project.id) {
    // If the user created the project then they automatically have permission
    if (project.createdById === context.token.id) {
      return true;
    }

    // If the current user is an Admin and the creator of the plan has the same affiliation
    if (await isAdmin(context.token)) {
      const projectCreator = await User.findById(reference, context, project.createdById);
      if (projectCreator && projectCreator.affiliationId === context.token.affiliationId) {
        return true;
      }
    }

    // Otherwise check to see if the user is a collaborator on the project
    const collaborators = await ProjectCollaborator.findByProjectId(reference, context, project.id);
    if (Array.isArray(collaborators) && collaborators.length > 0) {
      const collab = collaborators.find((collaborator) => collaborator.userId === context.token.id);
      if (collab) {
        switch (requiredAccessLevel) {
          case ProjectCollaboratorAccessLevel.COMMENT:
            return true;
          case ProjectCollaboratorAccessLevel.EDIT:
            return collab.accessLevel === ProjectCollaboratorAccessLevel.OWN ||
                   collab.accessLevel === ProjectCollaboratorAccessLevel.EDIT;
          case ProjectCollaboratorAccessLevel.OWN:
            return collab.accessLevel === ProjectCollaboratorAccessLevel.OWN;
          default:
            return false;
        }
      }
    }
  }

  const payload = { projectId: project?.id, userId: context.token?.id };
  context.logger.error(prepareObjectForLogs(payload), `AUTH failure: ${reference}`);
  return false;
}

// Set the current user as the owner of the project
export const setCurrentUserAsProjectOwner = async (
  context: MyContext,
  projectId: number,
): Promise<boolean> => {
  if (!isNullOrUndefined(context.token)) {
    // Automatically add the current user as a projectCollaborator with acccessLevel = OWN
    const collaborator = new ProjectCollaborator({
      projectId: projectId,
      email: context.token.email,
      userId: context.token.id,
      accessLevel: 'OWN',
    });
    // Create the ProjectCollaborator record but skip sending an email notification
    // because the user already knows they can edit their own project!
    const owner = await collaborator.create(context, false);
    if (owner && !owner.hasErrors()) {
      return true;
    }
  }
  return false;
}

// Make sure the project has a primary contact defined. If not default to the owner
export const ensureDefaultProjectContact = async (
  context: MyContext,
  project: Project
): Promise<boolean> => {
  const reference = 'projectService.ensureProjectHasPrimaryContact';

  if (!isNullOrUndefined(project)) {
    const current = await ProjectMember.findPrimaryContact(reference, context, project.id);

    if (isNullOrUndefined(current)) {
      const owner = await User.findById(reference, context, project.createdById);
      const dfltRole = await MemberRole.defaultRole(context, reference);

      if (!isNullOrUndefined(owner)) {
        // Create a new member record from the user and set as the primary contact
        const member = new ProjectMember({
          ...owner,
          email: await owner.getEmail(context),
          projectId: project.id,
          isPrimaryContact: true,
          memberRoles: [dfltRole],
        });

        const created = await member.create(context, project.id);
        // Actually add the record for the member role. We will want to revisit someday
        // and possibly just add this right into the ProjectMember model
        if (await dfltRole.addToProjectMember(context, created.id)) {
          return !isNullOrUndefined(created);
        }
      }
    } else {
      // One is defined already
      return true;
    }
  }
  return false;
}
