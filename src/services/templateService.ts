import { incrementVersionNumber } from "../utils/helpers";
import { Template, TemplateVisibility } from "../models/Template";
import { VersionedTemplate, TemplateVersionType } from "../models/VersionedTemplate";
import { MyContext } from "../context";
import { isSuperAdmin } from "./authService";
import { TemplateCollaborator } from "../models/Collaborator";
import { Section } from "../models/Section";
import { generateSectionVersion } from "./sectionService";
import { formatLogMessage, logger } from "../logger";


// Determine whether the specified user has permission to access the Template
export const hasPermissionOnTemplate = async (context: MyContext, template: Template): Promise<boolean> => {
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

  const payload = { templateId: template.id, userId: context.token.id };
  formatLogMessage(context.logger).error(payload, 'AUTH failure: hasPermissionOnTemplate')
  return false;
}

// Creates a new Version/Snapshot the specified Template (as a point in time snapshot)
//    - bumps the `latestPublishVersion` on the specified `template`
//    - deactivates all of the existing VersionedTemplates in the `versions` array
//    - creates a new VersionedTemplate that is active and adds it to the `versions` array
export const generateTemplateVersion = async (
  context: MyContext,
  template: Template,
  versions: VersionedTemplate[],
  versionerId: number,
  comment = '',
  visibility = TemplateVisibility.PRIVATE,
  versionType = TemplateVersionType.DRAFT,
): Promise<VersionedTemplate> => {
  // If the template has no id then it has not yet been saved so throw an error
  if (!template.id) {
    throw new Error('Cannot publish unsaved Template');
  }

  // If the template has a current version but no recent changes throw an error
  if (template.latestPublishVersion && !template.isDirty) {
    throw new Error('There are no changes to publish');
  }

  // Figure out the next version number
  let newVersion = 'v1';
  if (versions.length > 0) {
    const sortedVersions = versions.sort((a, b) => b.version.localeCompare(a.version));
    newVersion = incrementVersionNumber(sortedVersions[0].version);
  }

  // Intialize the new Version
  const versionedTemplate = new VersionedTemplate({
    version: newVersion,
    templateId: template.id,
    name: template.name,
    description: template.description,
    ownerId: template.ownerId,
    versionedById: versionerId,
    visibility: visibility || template.visibility,
    bestPactice: template.bestPractice,
    languageId: template.languageId,
    versionType,
    comment,
    active: true,
    createdById: template.createdById,
    created: template.created,
    modifiedById: template.modifiedById,
    modified: template.modified,
  });
  const created = await versionedTemplate.create(context);

  // If the version was successfully created and there are no errors
  if (created && (!created.errors || (Array.isArray(created.errors) && created.errors.length === 0))) {
    const sections = await Section.findByTemplateId('generateTemplateVersion', context, template.id);

    try {
      let allSectionsWereVersioned = true;

      for (const section of sections) {
        const sectionInstance = new Section({
          ...section
        });

        const passed = await generateSectionVersion(context, sectionInstance, created.id);
        if (!passed) {
          allSectionsWereVersioned = false;
        }
      }

      // Only continue if all of the sections were properly versioned
      if (allSectionsWereVersioned) {
        // Update the template's version and reset the dirty flag
        template.latestPublishVersion = newVersion;
        template.latestPublishDate = created.created;
        template.isDirty = false;

        // Pass the noTouch flag to avoid default behavior of setting isDirty, modified, etc.
        const updated = await template.update(context, true);
        if (updated && (!updated.errors || (Array.isArray(updated.errors) && updated.errors.length === 0))) {
          return created;
        } else {
          const msg = `Unable to generateTemplateVersion for template: ${template.id}, errs: ${updated.errors}`;
          formatLogMessage(logger).error(null, msg);
          throw new Error(msg);
        }
      }
    } catch (err) {
      formatLogMessage(logger).error(err, `Unable to generateTemplateVersion for id: ${template.id}`);
      throw new Error(err.message);
    }
  } else {
    const msg = `Unable to generateTemplateVersion for versionedTemplate errs: ${created.errors}`;
    formatLogMessage(logger).error(null, msg);
    throw new Error(msg);
  }
  // Something went wrong, so return a null instead
  return null;
}

// Make a copy of the specified Template or PublishedTemplate
export const cloneTemplate = (
  clonedById: number,
  newOwnerId: string,
  template: Template | VersionedTemplate
): Template => {
  // If the incoming is a VersionedTemplate, then use the templateId (the template it was based off of)
  const sourceId = Object.keys(template).includes('templateId') ? template['templateId'] : template.id;
  const templateCopy = new Template({
    name: `Copy of ${template.name}`,
    description: template.description,
    languageId: template.languageId,
    ownerId: newOwnerId,
    sourceTemplateId: sourceId,
  });
  // Fo some reason this doesn't work when passing in the constructor.
  templateCopy.createdById = clonedById;

  // TODO: Copy all of the Sections and Questions

  return templateCopy;
}
