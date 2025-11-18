import { MyContext } from "../context";
import { GuidanceGroup } from "../models/GuidanceGroup";
import { Guidance } from "../models/Guidance";
import { VersionedGuidanceGroup } from "../models/VersionedGuidanceGroup";
import { VersionedGuidance } from "../models/VersionedGuidance";
import { Tag } from "../models/Tag";
import { prepareObjectForLogs } from "../logger";
import { getCurrentDate } from "../utils/helpers";
import { isSuperAdmin } from "./authService";

// Check if the user has permission to access the GuidanceGroup
export const hasPermissionOnGuidanceGroup = async (
  context: MyContext,
  guidanceGroupId: number
): Promise<boolean> => {
  const guidanceGroup = await GuidanceGroup.findById('hasPermissionOnGuidanceGroup', context, guidanceGroupId);
  
  if (!guidanceGroup) {
    return false;
  }

  // User must be from the same organization as the guidance group OR be a super admin
  return context?.token?.affiliationId === guidanceGroup.affiliationId || isSuperAdmin(context?.token);
};

// Creates a new Version/Snapshot of the specified GuidanceGroup
// - Creates a new VersionedGuidanceGroup including all of the related Guidance
// - Resets the isDirty flag on the GuidanceGroup
// - Sets active flag to true on new version and false on all previous versions
export const publishGuidanceGroup = async (
  context: MyContext,
  guidanceGroup: GuidanceGroup,
): Promise<boolean> => {
  const reference = 'publishGuidanceGroup';

  // If the guidance group has no id then it has not yet been saved so throw an error
  if (!guidanceGroup.id) {
    throw new Error('Cannot publish unsaved GuidanceGroup');
  }

  // Get the current version number
  const existingVersions = await VersionedGuidanceGroup.findByGuidanceGroupId(reference, context, guidanceGroup.id);
  const nextVersion = existingVersions.length > 0 ? Math.max(...existingVersions.map(v => v.version || 0)) + 1 : 1;

  // Create the new Version
  const versionedGuidanceGroup = new VersionedGuidanceGroup({
    guidanceGroupId: guidanceGroup.id,
    version: nextVersion,
    bestPractice: guidanceGroup.bestPractice,
    optionalSubset: guidanceGroup.optionalSubset,
    active: true,
    name: guidanceGroup.name,
    createdById: context.token?.id,
    modifiedById: context.token?.id,
  });

  try {
    const created = await versionedGuidanceGroup.create(context);

    // If the creation was successful
    if (created && !created.hasErrors()) {
      // Deactivate all previous versions
      await VersionedGuidanceGroup.deactivateAll(reference, context, guidanceGroup.id);
      
      // Set this version as active (in case deactivateAll affected it)
      created.active = true;
      await created.update(context, true);

      // Create a version for all the associated guidance items
      const guidanceItems = await Guidance.findByGuidanceGroupId(reference, context, guidanceGroup.id);
      let allGuidanceWereVersioned = true;

      for (const guidance of guidanceItems) {
        const guidanceInstance = new Guidance({
          ...guidance
        });
        const passed = await generateGuidanceVersion(context, guidanceInstance, created.id);
        if (!passed) {
          allGuidanceWereVersioned = false;
        }
      }

      // Only continue if all the associated guidance were properly versioned
      if (allGuidanceWereVersioned) {
        // Reset the dirty flag on the guidance group and update the published info
        guidanceGroup.isDirty = false;
        guidanceGroup.latestPublishedVersion = nextVersion.toString();
        guidanceGroup.latestPublishedDate = getCurrentDate();
        const updated = await guidanceGroup.update(context, true);

        if (updated && !updated.hasErrors()) return true;

        const msg = `Unable to set the isDirty flag for guidance group: ${guidanceGroup.id}`;
        context.logger.error(prepareObjectForLogs(updated), msg);
        throw new Error(msg);
      }
    } else {
      const msg = `Unable to create a new version for guidance group: ${guidanceGroup.id}`;
      context.logger.error(prepareObjectForLogs(created), msg);
      throw new Error(msg);
    }
  } catch (err) {
    context.logger.error(prepareObjectForLogs(err), `Unable to generate a new version for guidance group: ${guidanceGroup.id}`);
    throw err;
  }

  return false;
};

// Unpublish a GuidanceGroup by setting all versions to inactive
export const unpublishGuidanceGroup = async (
  context: MyContext,
  guidanceGroup: GuidanceGroup,
): Promise<boolean> => {
  const reference = 'unpublishGuidanceGroup';

  if (!guidanceGroup.id) {
    throw new Error('Cannot unpublish unsaved GuidanceGroup');
  }

  try {
    // Deactivate all versions
    const success = await VersionedGuidanceGroup.deactivateAll(reference, context, guidanceGroup.id);

    if (success) {
      return true;
    } else {
      const msg = `Unable to unpublish guidance group: ${guidanceGroup.id}`;
      context.logger.error(prepareObjectForLogs({ guidanceGroupId: guidanceGroup.id }), msg);
      throw new Error(msg);
    }
  } catch (err) {
    context.logger.error(prepareObjectForLogs(err), `Unable to unpublish guidance group: ${guidanceGroup.id}`);
    throw err;
  }
};

// Helper function to create a version of a Guidance item
const generateGuidanceVersion = async (
  context: MyContext,
  guidance: Guidance,
  versionedGuidanceGroupId: number,
): Promise<boolean> => {
  const reference = 'generateGuidanceVersion';

  if (!guidance.id) {
    throw new Error('Cannot publish unsaved Guidance');
  }

  // Get the tags for this guidance
  const tags = await Tag.findByGuidanceId(reference, context, guidance.id);
  
  // For each tag, create a VersionedGuidance entry
  // Each tag gets its own VersionedGuidance record pointing to the same guidanceText
  const tagsToVersion = tags && tags.length > 0 ? tags : [];
  
  if (tagsToVersion.length === 0) {
    // Guidance must have tags
    context.logger.error(
      prepareObjectForLogs({ guidanceId: guidance.id }), 
      'Cannot publish guidance without tags - guidance must be associated with at least one tag'
    );
    return false;
  }

  try {
    // Create a single VersionedGuidance entry (not one per tag)
    const versionedGuidance = new VersionedGuidance({
      versionedGuidanceGroupId: versionedGuidanceGroupId,
      guidanceId: guidance.id,
      guidanceText: guidance.guidanceText,
      tagId: tagsToVersion[0].id, // Use first tag as the tagId field
      createdById: guidance.createdById,
      created: guidance.created,
      modifiedById: guidance.modifiedById,
      modified: guidance.modified,
    });

    const created = await versionedGuidance.create(context);

    if (!created || created.hasErrors()) {
      const msg = `Unable to create versioned guidance for guidance: ${guidance.id}`;
      context.logger.error(prepareObjectForLogs(created), msg);
      return false;
    }

    // Add all tags to the versioned guidance tags table
    for (const tagToAdd of tagsToVersion) {
      await tagToAdd.addToVersionedGuidance(context, created.id);
    }

    return true;
  } catch (err) {
    context.logger.error(prepareObjectForLogs(err), `Unable to generate version for guidance: ${guidance.id}`);
    return false;
  }
};

// Mark a GuidanceGroup as dirty when any of its guidance is modified
export const markGuidanceGroupAsDirty = async (
  context: MyContext,
  guidanceGroupId: number,
): Promise<void> => {
  const reference = 'markGuidanceGroupAsDirty';
  
  try {
    const guidanceGroup = await GuidanceGroup.findById(reference, context, guidanceGroupId);
    
    if (guidanceGroup) {
      // Only mark as dirty if there's an active version
      const activeVersion = await VersionedGuidanceGroup.findActiveByGuidanceGroupId(reference, context, guidanceGroupId);
      
      if (activeVersion) {
        guidanceGroup.isDirty = true;
        await guidanceGroup.update(context, true);
      }
    }
  } catch (err) {
    context.logger.error(prepareObjectForLogs(err), `Unable to mark guidance group as dirty: ${guidanceGroupId}`);
    throw err;
  }
};
