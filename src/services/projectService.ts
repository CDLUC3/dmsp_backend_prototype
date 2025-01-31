import { MyContext } from "../context";
import { formatLogMessage } from "../logger";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { isAdmin, isSuperAdmin } from "./authService";

// Determine whether the specified user has permission to access the Section
export const hasPermissionOnProject = async (context: MyContext, project: Project): Promise<boolean> => {
  const reference = 'projectService.hasPermissionOnProject';

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
    // TODO: Add additional logic if necessary to give users other than the owner access
  }

  const payload = { projectId: project.id, userId: context.token.id };
  formatLogMessage(context).error(payload, `AUTH failure: ${reference}`)
  return false;
}