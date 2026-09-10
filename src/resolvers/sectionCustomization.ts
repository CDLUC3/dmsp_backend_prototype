import {
  AddCustomSectionInput,
  AddSectionCustomizationInput,
  MoveCustomSectionInput,
  Resolvers,
  UpdateCustomSectionInput, UpdateSectionCustomizationInput,
  VersionedSection as VersionedSectionGql
} from "../types.js";
import { MyContext } from "../context.js";
import {
  TemplateCustomization,
  TemplateCustomizationMigrationStatus
} from "../models/TemplateCustomization.js";
import { authenticatedResolver } from "../services/authService.js";
import { InternalServerError, NotFoundError } from "../utils/graphQLErrors.js";
import {
  getValidatedCustomization,
  markTemplateCustomizationAsDirty
} from "../services/templateCustomizationService.js";
import { SectionCustomization } from "../models/SectionCustomization.js";
import { VersionedSection } from "../models/VersionedSection.js";
import { CustomSection, PinnedSectionTypeEnum } from "../models/CustomSection.js";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";
import { UserRole } from "../models/User.js";

export const resolvers: Resolvers = {
  Query: {
    /**
     * ADMIN ONLY: Fetch the specified SectionCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the SectionCustomization
     * @param context The Apollo context
     * @returns The SectionCustomization (with errors if applicable)
     * @throws NotFoundError when the SectionCustomization or TemplateCustomization
     * are not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    sectionCustomization: authenticatedResolver(
      'sectionCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { sectionCustomizationId }: { sectionCustomizationId: number },
        context: MyContext
      ): Promise<SectionCustomization> => {
        const ref = 'sectionCustomization resolver';

        const customization = await SectionCustomization.findById(
          ref,
          context,
          sectionCustomizationId
        );
        if (!customization) throw NotFoundError();

        // Find the parent template customization and verify the user has access.
        // This will throw a forbidden error if they do not.
        const parent: TemplateCustomization = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );
        if (isNullOrUndefined(parent)) throw NotFoundError();

        return customization;
      }),

    sectionCustomizationByVersionedSection: authenticatedResolver(
      'sectionCustomizationByVersionedSection resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { templateCustomizationId, versionedSectionId }: { templateCustomizationId: number; versionedSectionId: number },
        context: MyContext
      ): Promise<SectionCustomization | null> => {
        const ref = 'sectionCustomizationByVersionedSection resolver';

        const parent = await getValidatedCustomization(ref, context, templateCustomizationId);
        if (isNullOrUndefined(parent)) throw NotFoundError();

        // Returns null if no customization exists yet — not a 404
        const customization = await SectionCustomization.findByCustomizationAndVersionedSection(ref, context, templateCustomizationId, versionedSectionId);
        return customization ?? null;
      }
    ),

    /**
     * ADMIN ONLY: Fetch the specified CustomSection
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the CustomSection
     * @param context The Apollo context
     * @returns The CustomSection or null
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    customSection: authenticatedResolver(
      'customSection resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { customSectionId }: { customSectionId: number },
        context: MyContext
      ): Promise<CustomSection> => {
        const ref = 'customSection resolver'
        // Fetch the CustomSection
        const customization = await CustomSection.findById(
          ref,
          context,
          customSectionId
        );
        if (!customization) throw NotFoundError();

        // Find the parent template customization and verify the user has access.
        // This will throw a forbidden error if they do not.
        const parent: TemplateCustomization = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );
        if (isNullOrUndefined(parent)) throw NotFoundError();

        return customization;
      }),
  },

  Mutation: {
    /**
     * ADMIN ONLY: Create a new SectionCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { templateCustomizationId, versionedSectionId }
     * @param context The Apollo context
     * @returns The SectionCustomization (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomSection or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    addSectionCustomization: authenticatedResolver(
      'addSectionCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: AddSectionCustomizationInput },
        context: MyContext
      ): Promise<SectionCustomization> => {
        const ref = 'addSectionCustomization resolver';
        const { templateCustomizationId, versionedSectionId } = input;

        // Fetch the versioned section
        const section = await VersionedSection.findById(
          ref,
          context,
          versionedSectionId
        );
        if (!section) throw NotFoundError();

        // Fetch the parent template customization and verify that the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          templateCustomizationId
        );

        const customization = new SectionCustomization({
          templateCustomizationId,
          sectionId: section.sectionId,
          migrationStatus: TemplateCustomizationMigrationStatus.OK
        });

        // Save the new section customization
        const created = await customization.create(context);
        if (isNullOrUndefined(created)) throw InternalServerError();

        // If it was successfully created, update the parent's isDirty flag
        if (!created.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, created);
        }
        return created;
      }),

    /**
     * ADMIN ONLY: Update the specified SectionCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { sectionCustomizationId, guidance }
     * @param context The Apollo context
     * @returns The SectionCustomization (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomSection or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    updateSectionCustomization: authenticatedResolver(
      'updateSectionCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: UpdateSectionCustomizationInput },
        context: MyContext
      ): Promise<SectionCustomization> => {
        const { sectionCustomizationId, guidance } = input;
        const ref = 'updateSectionCustomization resolver';

        // Fetch the specified SectionCustomization
        const customization = await SectionCustomization.findById(
          ref,
          context,
          sectionCustomizationId
        );
        if (!customization) throw NotFoundError();

        // Fetch the parent templateCustomization and make sure the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );

        // Update the guidance
        customization.guidance = guidance ?? undefined;
        const updated = await customization.update(context);
        if (isNullOrUndefined(updated)) throw InternalServerError();

        // If it was successfully updated, update the parent's isDirty flag
        if (!updated.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, updated);
        }
        return updated;
      }
    ),

    /**
     * ADMIN ONLY: Delete the specified SectionCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the SectionCustomization to remove
     * @param context The Apollo context
     * @returns The SectionCustomization (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomSection or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    removeSectionCustomization: authenticatedResolver(
      'removeSectionCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { sectionCustomizationId }: { sectionCustomizationId: number },
        context: MyContext
      ): Promise<SectionCustomization> => {
        const ref = 'removeSectionCustomization resolver';
        const customization = await SectionCustomization.findById(
          ref,
          context,
          sectionCustomizationId
        );
        if (!customization) throw NotFoundError();

        // Fetch the parent template customization and verify the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );

        const deleted = await customization.delete(context);
        if (isNullOrUndefined(deleted)) throw InternalServerError();
        // If it was successfully deleted, update the parent's isDirty flag
        if (!deleted.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, deleted);
        }
        return deleted;
      }),

    /**
     * ADMIN ONLY: Create a new CustomSection.
     * The section will appear first in the template if the pinnedSectionId is null
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { templateCustomizationId, pinnedSectionType,
     * pinnedSectionId }
     * @param context The Apollo context
     * @returns The CustomSection (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomSection or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    addCustomSection: authenticatedResolver(
      'addCustomSection resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: AddCustomSectionInput },
        context: MyContext
      ): Promise<CustomSection> => {
        const ref = 'addCustomSection resolver';
        const { name, introduction, requirements, guidance, templateCustomizationId, pinnedSectionType, pinnedSectionId } = input;

        // Fetch the parent template customization and verify the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          templateCustomizationId
        );

        const customSection = new CustomSection({
          name,
          introduction: introduction ?? undefined,
          requirements: requirements ?? undefined,
          guidance: guidance ?? undefined,
          templateCustomizationId,
          pinnedSectionType: pinnedSectionType ?? undefined,
          pinnedSectionId: pinnedSectionId ?? undefined,
          migrationStatus: TemplateCustomizationMigrationStatus.OK,
        });

        // Save the new custom section
        const created = await customSection.create(context);
        if (isNullOrUndefined(created)) throw InternalServerError();

        // If it was successfully created, update the parent's isDirty flag
        if (!created.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, created);
        }
        return created;
      }),

    /**
     * ADMIN ONLY: Update the specified CustomSection
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { customSectionId, name, introduction,
     * requirements, guidance }
     * @param context The Apollo context
     * @returns The CustomSection (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomSection or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    updateCustomSection: authenticatedResolver(
      'updateCustomSection resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: UpdateCustomSectionInput },
        context: MyContext
      ): Promise<CustomSection> => {
        const ref = 'updateCustomSection resolver';
        const { customSectionId, name, introduction, requirements, guidance } = input;

        const customization = await CustomSection.findById(
          ref,
          context,
          customSectionId
        );
        if (!customization) throw NotFoundError();

        // Fetch the parent template customization and verify that the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );

        // Update the section
        customization.name = name;
        customization.introduction = introduction ?? undefined;
        customization.requirements = requirements ?? undefined;
        customization.guidance = guidance ?? undefined;
        const updated = await customization.update(context);
        if (isNullOrUndefined(updated)) throw InternalServerError();

        // If it was successfully updated, update the parent's isDirty flag
        if (!updated.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, updated);
        }
        return updated;
      }),

    /**
     * ADMIN ONLY: Delete the specified CustomSection
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the CustomSection to remove
     * @param context The Apollo context
     * @returns The original CustomSection (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomSection or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    removeCustomSection: authenticatedResolver(
      'updateCustomSection resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { customSectionId }: { customSectionId: number },
        context: MyContext
      ): Promise<CustomSection> => {
        const ref = 'removeCustomSection resolver';
        const customization = await CustomSection.findById(
          ref,
          context,
          customSectionId
        );
        if (!customization) throw NotFoundError();

        // Fetch the parent template customization and verify that the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );

        const deleted = await customization.delete(context);
        if (isNullOrUndefined(deleted)) throw InternalServerError();
        // If it was successfully deleted, update the parent's isDirty flag
        if (!deleted.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, deleted);
        }
        return deleted;
      }),

    /**
     * ADMIN ONLY: Move the specified CustomSection by pinning it to the designated section.
     * It will become the first section of the template if newSectionId is `null`.
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { customSectionId, newSectionType, newSectionId }
     * @param context The Apollo context
     * @returns The CustomSection (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomSection or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    moveCustomSection: authenticatedResolver(
      'moveCustomSection resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: MoveCustomSectionInput },
        context: MyContext
      ): Promise<CustomSection> => {
        const ref = 'moveCustomSection resolver';
        const { customSectionId, newSectionType, newSectionId } = input;

        const customization = await CustomSection.findById(
          ref,
          context,
          customSectionId
        );
        if (!customization) throw NotFoundError();

        // Fetch the parent template customization and verify the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );

        const newPinType = newSectionType ? PinnedSectionTypeEnum[newSectionType] : undefined;
        customization.pinnedSectionType = newPinType ?? undefined;
        customization.pinnedSectionId = newSectionId ?? undefined;
        const moved = await customization.update(context);
        if (isNullOrUndefined(moved)) throw InternalServerError();

        // If it was successfully moved, update the parent's isDirty flag
        if (!moved.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, moved);
        }

        return moved;
      }),
  },

  SectionCustomization: {
    /**
     * The VersionedSection that the SectionCustomization applies to
     * @param parent The SectionCustomization
     * @param _ TArgs not used here
     * @param context The Apollo context
     * @returns The VersionedSection
     */
    versionedSection: async (
      parent,
      _: Record<PropertyKey, never>,
      context: MyContext
    ) => {
      const ref = 'SectionCustomization.versionedSection chained resolver';
      if (isNullOrUndefined(parent?.sectionId)) return null;

      const customization = await TemplateCustomization.findById(ref, context, parent.templateCustomizationId);
      if (isNullOrUndefined(customization)) return null;
      const versionedSection = await VersionedSection.findByVersionedTemplateIdAndSectionId(
        ref,
        context,
        customization.currentVersionedTemplateId,
        parent.sectionId
      );
      // Cast needed: the VersionedSection model doesn't structurally match the generated
      // VersionedSection type (e.g. nested Tag.slug is optional on the model but required
      // in the schema), and there are no codegen mappers configured to reconcile this.
      return (versionedSection ?? null) as unknown as VersionedSectionGql | null;
    },
    /**
     * Format the created date time
     * @param parent The SectionCustomization
     * @returns the formatted date
     */
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    /**
     * Format the modified date time
     * @param parent The SectionCustomization
     * @returns the formatted date time
     */
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },

  CustomSection: {
    /**
     * Format the created date time
     * @param parent The CustomSection
     * @returns the formatted date time
     */
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    /**
     * Format the modified date time
     * @param parent The CustomSection
     * @returns the formatted date time
     */
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },
};
