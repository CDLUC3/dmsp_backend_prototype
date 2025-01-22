import { MyContext } from "../context";
import { formatLogMessage } from "../logger";
import { Project } from "../models/Project";
import { isSuperAdmin } from "./authService";

// Determine whether the specified user has permission to access the Section
export const hasPermissionOnProject = async (context: MyContext, project: Project): Promise<boolean> => {
  // Super admins always have permission
  if (await isSuperAdmin(context.token)) {
    return true;
  }

  if (project && project.id) {
    // If the user created the project then they automatically have permission
    if (project.createdById === context.token.id) {
      return true;
    }

    // TODO: Add additional logic if necessary to give users other than the owner access
  }

  const payload = { projectId: project.id, userId: context.token.id };
  formatLogMessage(context.logger).error(payload, 'AUTH failure: hasPermissionOnProject')
  return false;
}