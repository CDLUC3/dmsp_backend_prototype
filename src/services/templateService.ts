import { incrementVersionNumber } from "../utils/helpers";
import { Template } from "../models/Template";
import { VersionedTemplate, VersionType } from "../models/VersionedTemplate";

export interface PublishResult {
  template: Template;
  versions: VersionedTemplate[];
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
  versionType = VersionType.Draft,
): Promise<PublishResult> => {
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
  const versionedTemplate = new VersionedTemplate({
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

  if (versionedTemplate) {
    // Deactivate the old versions
    versions.forEach((prior) => prior.active = false );

    // Bump the version number and add the new version
    template.currentVersion = newVersion;
    versions.push(versionedTemplate);
  }
  return { template, versions };
}

// Make a copy of the specified Template or PublishedTemplate
export const clone = (
  clonedById: number,
  newOwnerId: number,
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
