import { MyContext } from "../context";
import { formatLogMessage } from "../logger";
import { ProjectCollaborator, ProjectCollaboratorAccessLevel } from "../models/Collaborator";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { isAdmin, isSuperAdmin } from "./authService";

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
  formatLogMessage(context).error(payload, `AUTH failure: ${reference}`)
  return false;
}
