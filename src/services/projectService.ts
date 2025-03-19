import { MyContext } from "../context";
import { DMPCommonStandard } from "../datasources/dmphubAPI";
import { formatLogMessage } from "../logger";
import { ProjectCollaborator } from "../models/Collaborator";
import { Plan } from "../models/Plan";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { isAdmin, isSuperAdmin } from "./authService";
import { syncWithDMPHub, createPlanVersion } from "./planService";

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

    // Otherwise check to see if the user is a collaborator on the project
    const collaborators = await ProjectCollaborator.findByProjectId(reference, context, project.id);
    if (Array.isArray(collaborators) && collaborators.length > 0) {
      return collaborators.some((collaborator) => collaborator.userId === context.token.id);
    }
  }

  const payload = { projectId: project.id, userId: context.token.id };
  formatLogMessage(context).error(payload, `AUTH failure: ${reference}`)
  return false;
}

// Version and sync changes with the DMPHub
export const versionAndSyncPlans = async (
  context: MyContext,
  project: Project,
  reference = 'projectService.syncWithDMPHub'
): Promise<DMPCommonStandard> => {
  // Fetch all the plans for the project
  const plans = await Plan.findByProjectId(reference, context, project.id);
  if (!Array.isArray(plans) || plans.length === 0) {
    return null;
  }

  for (const plan of plans) {
    const newVersion = await createPlanVersion(context, plan, reference);
    if (newVersion) {
      await syncWithDMPHub(context, plan, reference);
    }
  }
}
