import { incrementVersionNumber } from "../utils/helpers";
import { Template } from "../models/Template";
import { VersionedTemplate, VersionType } from "../models/VersionedTemplate";
import { MyContext } from "../context";
import { isSuperAdmin } from "./authService";
import { TemplateCollaborator } from "../models/Collaborator";


// Determine whether the specified user has permission to access the Template
export const hasPermission = async (context: MyContext, template: Template): Promise<boolean> => {
  // If the current user belongs to the same affiliation OR the user is a super admin
  if (context.token?.affiliationId === template.ownerId || await isSuperAdmin(context.token)) {
    return true;
  }

  // Otherwise see if the user is one of the invited collaborators
  const collaborator = await TemplateCollaborator.findByTemplateIdAndEmail(
    'template resolver.hasPermission',
    context,
    template.id,
    context.token?.email,
  )
  if (collaborator) {
    return true;
  }
  return false;
}

// Creates a new Version/Snapshot the specified Template (as a point in time snapshot)
//    - bumps the `currentVersion` on the specified `template`
//    - deactivates all of the existing VersionedTemplates in the `versions` array
//    - creates a new VersionedTemplate that is active and adds it to the `versions` array
export const generateVersion = async (
  template: Template,
  versions: VersionedTemplate[],
  versionerId: number,
  comment = '',
  versionType = VersionType.DRAFT,
): Promise<VersionedTemplate> => {
  // If the template has no idea then it has not yet been saved so throw an error
  if (!template.id) {
    throw new Error('Cannot publish unsaved Template');
  }

  // If the template has a current version but no recent changes throw an error
  if (template.currentVersion && !template.isDirty) {
    throw new Error('There are no changes to publish');
  }

  // Figure out the next version number
  let newVersion = 'v1';
  if (versions.length > 0) {
    const sortedVersions = versions.sort((a, b) => b.version.localeCompare(a.version) );
    newVersion = incrementVersionNumber(sortedVersions[0].version);
  }

  // Intialize the new Version
  return new VersionedTemplate({
    version: newVersion,
    templateId: template.id,
    name: template.name,
    description: template.description,
    ownerId: template.ownerId,
    versionedById: versionerId,
    visibility: template.visibility,
    bestPactice: template.bestPractice,
    createdById: versionerId,
    versionType,
    comment,
    active: true,
  });
}

// Make a copy of the specified Template or PublishedTemplate
export const clone = (
  clonedById: number,
  newOwnerId: string,
  template: Template | VersionedTemplate
): Template => {
  const templateCopy = new Template({
    name: `Copy of ${template.name}`,
    description: template.description,
    ownerId: newOwnerId,
  });
  // Fo some reason this doesn't work when passing in the constructor.
  templateCopy.createdById = clonedById;

  // TODO: Copy all of the Sections and Questions

  return templateCopy;
}
