import { incrementVersionNumber } from "../utils/helpers";
import { Template, PublishedTemplate } from "../models/Template";

export interface PublishResult {
  template: Template;
  versions: PublishedTemplate[];
}

// Publishes the specified Template (as a point in time snapshot)
//    - bumps the `currentVersion` on the specified `template`
//    - deactivates all of the existing PublishedTemplates in the `versions` array
//    - creates a new PublishedTemplate that is active and adds it to the `versions` array
export const publish = async (
  template: Template,
  versions: PublishedTemplate[],
  publisherId: number,
  comment: string = '',
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
  const publishedTemplate = new PublishedTemplate(
    template.id,
    newVersion,
    template.name,
    template.affiliationId,
    publisherId,
    template.visibility,
    comment,
    true,
  );

  if (publishedTemplate) {
    // Deactivate the old versions
    versions.forEach((prior) => prior.active = false );

    // Bump the version number and add the new version
    template.currentVersion = newVersion;
    versions.push(publishedTemplate);
  }
  return { template, versions };
}

// Make a copy of the specified Template or PublishedTemplate
export const clone = (
  ownerId: number,
  affiliationId: string,
  template: Template | PublishedTemplate
): Template => {
  const templateCopy = new Template(
    `Copy of ${template.name}`,
    affiliationId,
    ownerId,
  );

  // TODO: Copy all of the Sections and Questions

  return templateCopy;
}
