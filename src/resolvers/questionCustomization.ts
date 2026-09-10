import {
  AddCustomQuestionInput,
  AddQuestionCustomizationInput,
  CustomQuestion as CustomQuestionGQL,
  MoveCustomQuestionInput,
  Resolvers,
  UpdateCustomQuestionInput, UpdateQuestionCustomizationInput
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
import { QuestionCustomization } from "../models/QuestionCustomization.js";
import { CustomQuestion, PinnedQuestionTypeEnum } from "../models/CustomQuestion.js";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";
import { UserRole } from "../models/User.js";
import { PinnedSectionTypeEnum } from "../models/CustomSection.js";
import { VersionedQuestion } from "../models/VersionedQuestion.js";

export const resolvers: Resolvers = {
  Query: {
    /**
     * ADMIN ONLY: Fetch the specified QuestionCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the QuestionCustomization
     * @param context The Apollo context
     * @returns The QuestionCustomization (with errors if applicable)
     * @throws NotFoundError when the QuestionCustomization or TemplateCustomization
     * are not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    questionCustomization: authenticatedResolver(
      'questionCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { questionCustomizationId }: { questionCustomizationId: number },
        context: MyContext
      ): Promise<QuestionCustomization> => {
        const ref = 'questionCustomization resolver';

        const customization = await QuestionCustomization.findById(
          ref,
          context,
          questionCustomizationId
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

    /** 
     * ADMIN ONLY: Fetch the QuestionCustomization for a given versioned section
     */
    questionCustomizationByVersionedQuestion: authenticatedResolver(
      'questionCustomizationByVersionedQuestion resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { templateCustomizationId, versionedQuestionId }: { templateCustomizationId: number; versionedQuestionId: number },
        context: MyContext
      ): Promise<QuestionCustomization | null> => {
        const ref = 'questionCustomizationByVersionedQuestion resolver';

        const parent = await getValidatedCustomization(ref, context, templateCustomizationId);
        if (isNullOrUndefined(parent)) throw NotFoundError();

        // Returns null if no customization exists yet — not a 404
        const customization = await QuestionCustomization.findByCustomizationAndVersionedQuestion(ref, context, templateCustomizationId, versionedQuestionId);
        return customization ?? null;
      }
    ),

    /**
     * ADMIN ONLY: Fetch the specified CustomQuestion
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the CustomQuestion
     * @param context The Apollo context
     * @returns The CustomQuestion or null
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    customQuestion: authenticatedResolver(
      'customQuestion resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { customQuestionId }: { customQuestionId: number },
        context: MyContext
      ): Promise<CustomQuestionGQL> => {
        const ref = 'customQuestion resolver'
        // Fetch the CustomQuestion
        const customization = await CustomQuestion.findById(
          ref,
          context,
          customQuestionId
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

        // The model's `sectionType` is typed optional to support the temporary "unpinned"
        // state used while reordering questions, but the schema requires it. Bridge the two.
        return customization as unknown as CustomQuestionGQL;
      }),
  },

  Mutation: {
    /**
     * ADMIN ONLY: Create a new QuestionCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { templateCustomizationId, versionedSectionId }
     * @param context The Apollo context
     * @returns The QuestionCustomization (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomQuestion or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    addQuestionCustomization: authenticatedResolver(
      'addQuestionCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: AddQuestionCustomizationInput },
        context: MyContext
      ): Promise<QuestionCustomization> => {
        const ref = 'addQuestionCustomization resolver';
        const { templateCustomizationId, versionedQuestionId } = input;

        // Fetch the versioned question
        const question = await VersionedQuestion.findById(
          ref,
          context,
          versionedQuestionId
        );
        if (!question) throw NotFoundError();


        // Fetch the parent template customization and verify that the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          templateCustomizationId
        );

        const customization = new QuestionCustomization({
          templateCustomizationId,
          questionId: question.questionId,
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
     * ADMIN ONLY: Update the specified QuestionCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { questionCustomizationId, guidance }
     * @param context The Apollo context
     * @returns The QuestionCustomization (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomQuestion or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    updateQuestionCustomization: authenticatedResolver(
      'updateQuestionCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: UpdateQuestionCustomizationInput },
        context: MyContext
      ): Promise<QuestionCustomization> => {
        const { questionCustomizationId, guidanceText, sampleText } = input;
        const ref = 'updateQuestionCustomization resolver';

        // Fetch the specified QuestionCustomization
        const customization = await QuestionCustomization.findById(
          ref,
          context,
          questionCustomizationId
        );
        if (!customization) throw NotFoundError();

        // Fetch the parent templateCustomization and make sure the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );

        // Update the guidance
        customization.guidanceText = guidanceText ?? undefined;
        customization.sampleText = sampleText ?? undefined;
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
     * ADMIN ONLY: Delete the specified QuestionCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the QuestionCustomization to remove
     * @param context The Apollo context
     * @returns The QuestionCustomization (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomQuestion or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    removeQuestionCustomization: authenticatedResolver(
      'removeQuestionCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { questionCustomizationId }: { questionCustomizationId: number },
        context: MyContext
      ): Promise<QuestionCustomization> => {
        const ref = 'removeQuestionCustomization resolver';
        const customization = await QuestionCustomization.findById(
          ref,
          context,
          questionCustomizationId
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
     * ADMIN ONLY: Create a new CustomQuestion.
     * The section will appear first in the template if the pinnedQuestionId is null
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { templateCustomizationId, pinnedQuestionType,
     * pinnedQuestionId }
     * @param context The Apollo context
     * @returns The CustomQuestion (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomQuestion or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    addCustomQuestion: authenticatedResolver(
      'addCustomQuestion resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: AddCustomQuestionInput },
        context: MyContext
      ): Promise<CustomQuestionGQL> => {
        const ref = 'addCustomQuestion resolver';

        // Fetch the parent template customization and verify the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          input.templateCustomizationId
        );

        const customQuestion = new CustomQuestion({
          templateCustomizationId: input.templateCustomizationId,
          sectionType: input.sectionType,
          sectionId: input.sectionId,
          pinnedQuestionType: input.pinnedQuestionType ?? undefined,
          pinnedQuestionId: input.pinnedQuestionId ?? undefined,
          questionText: input.questionText ?? undefined,
          json: input.json ?? undefined,
          requirementText: input.requirementText ?? undefined,
          guidanceText: input.guidanceText ?? undefined,
          sampleText: input.sampleText ?? undefined,
          useSampleTextAsDefault: input.useSampleTextAsDefault ?? undefined,
          required: input.required ?? undefined,
          migrationStatus: TemplateCustomizationMigrationStatus.OK
        });

        // Save the new custom section
        const created = await customQuestion.create(context);
        if (isNullOrUndefined(created)) throw InternalServerError();

        // If it was successfully created, update the parent's isDirty flag
        if (!created.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, created);
        }
        return created as unknown as CustomQuestionGQL;
      }),

    /**
     * ADMIN ONLY: Update the specified CustomQuestion
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { customQuestionId, name, introduction,
     * requirements, guidance }
     * @param context The Apollo context
     * @returns The CustomQuestion (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomQuestion or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    updateCustomQuestion: authenticatedResolver(
      'updateCustomQuestion resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: UpdateCustomQuestionInput },
        context: MyContext
      ): Promise<CustomQuestionGQL> => {
        const ref = 'updateCustomQuestion resolver';
        const { customQuestionId, questionText, json, requirementText, guidanceText,
          sampleText, useSampleTextAsDefault, required } = input;

        const customization = await CustomQuestion.findById(
          ref,
          context,
          customQuestionId
        );
        if (!customization) throw NotFoundError();

        // Fetch the parent template customization and verify that the user has access
        const parent = await getValidatedCustomization(
          ref,
          context,
          customization.templateCustomizationId
        );

        // Update the section
        customization.questionText = questionText;
        customization.json = json;
        customization.requirementText = requirementText ?? undefined;
        customization.guidanceText = guidanceText ?? undefined;
        customization.sampleText = sampleText ?? undefined;
        customization.useSampleTextAsDefault = useSampleTextAsDefault ?? undefined;
        customization.required = required ?? false;
        const updated = await customization.update(context);
        if (isNullOrUndefined(updated)) throw InternalServerError();

        // If it was successfully updated, update the parent's isDirty flag
        if (!updated.hasErrors() && !parent.isDirty) {
          if (isNullOrUndefined(parent.id)) throw NotFoundError();
          await markTemplateCustomizationAsDirty(ref, context, parent.id, updated);
        }
        return updated as unknown as CustomQuestionGQL;
      }),

    /**
     * ADMIN ONLY: Delete the specified CustomQuestion
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the CustomQuestion to remove
     * @param context The Apollo context
     * @returns The original CustomQuestion (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomQuestion or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    removeCustomQuestion: authenticatedResolver(
      'updateCustomQuestion resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { customQuestionId }: { customQuestionId: number },
        context: MyContext
      ): Promise<CustomQuestionGQL> => {
        const ref = 'removeCustomQuestion resolver';
        const customization = await CustomQuestion.findById(
          ref,
          context,
          customQuestionId
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
        return deleted as unknown as CustomQuestionGQL;
      }),

    /**
     * ADMIN ONLY: Move the specified CustomQuestion by pinning it to the designated section.
     * It will become the first section of the template if newSectionId is `null`.
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args an object containing { customQuestionId, newSectionType, newSectionId }
     * @param context The Apollo context
     * @returns The CustomQuestion (with errors if applicable)
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws NotFoundError when the CustomQuestion or TemplateCustomization
     * cannot be found
     * @throws InternalServerError when a fatal error has occurred
     */
    moveCustomQuestion: authenticatedResolver(
      'moveCustomQuestion resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: MoveCustomQuestionInput },
        context: MyContext
      ): Promise<CustomQuestionGQL> => {
        const ref = 'moveCustomQuestion resolver';
        const { customQuestionId, sectionType, sectionId, pinnedQuestionType, pinnedQuestionId, direction } = input;
        const customization = await CustomQuestion.findById(ref, context, customQuestionId);

        if (!customization) throw NotFoundError();
        // sectionType is typed optional on the model (to allow a transient "unpinned"
        // state during a move), but a persisted CustomQuestion always has one set.
        if (isNullOrUndefined(customization.sectionType)) throw NotFoundError();
        const currentSectionType = customization.sectionType;

        const parent = await getValidatedCustomization(
          ref, context, customization.templateCustomizationId
        );
        if (isNullOrUndefined(parent.id)) throw NotFoundError();
        const parentId = parent.id;

        const newPinType = pinnedQuestionType ? PinnedQuestionTypeEnum[pinnedQuestionType] : undefined;
        const newSectionType = PinnedSectionTypeEnum[sectionType];
        const newPinnedQuestionType = newPinType ?? undefined;
        const newPinnedQuestionId = pinnedQuestionId ?? undefined;

        // Check if another question already occupies this exact position
        const occupant = await CustomQuestion.findByPosition(
          ref,
          context,
          parentId,
          newSectionType,
          sectionId,
          newPinnedQuestionType ?? null,
          newPinnedQuestionId ?? null
        );

        // Save customization's original position before any changes
        const originalSectionType = currentSectionType;
        const originalSectionId = customization.sectionId;
        const originalPinnedQuestionType = customization.pinnedQuestionType;
        const originalPinnedQuestionId = customization.pinnedQuestionId;

        if (occupant && occupant.id !== customQuestionId) {
          // Step 1: Temporarily free A's slot to a temporary position that won't conflict with any existing question
          customization.pinnedQuestionType = undefined;
          customization.pinnedQuestionId = undefined;
          const tempMoved = await customization.update(context);
          if (!tempMoved || tempMoved.hasErrors()) {
            throw new Error(`Failed to temporarily move question: ${JSON.stringify(tempMoved?.errors)}`);
          }

          // Step 2: Place occupant depending on direction (UP or DOWN). When A moves down to sit where B was, 
          // then B gets re-pinned from BASE to A. When A moves up to sit where B was, then B gets pinned from BASE to A's original position.
          if (direction === 'DOWN') {
            occupant.sectionType = newSectionType;
            occupant.sectionId = sectionId;
            occupant.pinnedQuestionType = PinnedQuestionTypeEnum.CUSTOM;
            occupant.pinnedQuestionId = customQuestionId;
          } else {
            occupant.sectionType = originalSectionType;
            occupant.sectionId = originalSectionId;
            occupant.pinnedQuestionType = originalPinnedQuestionType;
            occupant.pinnedQuestionId = originalPinnedQuestionId;
          }

          const swapped = await occupant.update(context);
          if (!swapped || swapped.hasErrors()) {
            throw new Error(`Failed to swap occupant: ${JSON.stringify(swapped?.errors)}`);
          }
        } else if (direction === 'UP') {
          // No occupant at target, but something may be chained after A
          const tailQuestion = await CustomQuestion.findByPosition(
            ref, context, parentId,
            originalSectionType, originalSectionId,
            PinnedQuestionTypeEnum.CUSTOM, customQuestionId
          );

          if (tailQuestion) {
            // Must temporarily free A's current slot FIRST before B can move into it
            customization.pinnedQuestionType = undefined;
            customization.pinnedQuestionId = undefined;
            const tempMoved = await customization.update(context);
            if (!tempMoved || tempMoved.hasErrors()) {
              throw new Error(`Failed to temporarily move question: ${JSON.stringify(tempMoved?.errors)}`);
            }

            // Now B can safely move to A's vacated slot
            tailQuestion.sectionType = originalSectionType;
            tailQuestion.sectionId = originalSectionId;
            tailQuestion.pinnedQuestionType = originalPinnedQuestionType;
            tailQuestion.pinnedQuestionId = originalPinnedQuestionId;
            const reanch = await tailQuestion.update(context);
            if (!reanch || reanch.hasErrors()) {
              throw new Error(`Failed to re-anchor tail question: ${JSON.stringify(reanch?.errors)}`);
            }
          }
        }

        // Step 3: Move A into its final target position
        customization.sectionType = newSectionType;
        customization.sectionId = sectionId;
        customization.pinnedQuestionType = newPinnedQuestionType;
        customization.pinnedQuestionId = newPinnedQuestionId;
        const moved = await customization.update(context);
        if (isNullOrUndefined(moved)) throw InternalServerError();

        if (!moved.hasErrors() && !parent.isDirty) {
          await markTemplateCustomizationAsDirty(ref, context, parentId, moved);
        }

        return moved as unknown as CustomQuestionGQL;
      }),
  },

  QuestionCustomization: {
    /**
     * The VersionedQuestion that the QuestionCustomization applies to
     * @param parent The QuestionCustomization
     * @param _ TArgs not used here
     * @param context The Apollo context
     * @returns The VersionedQuestion
     */
    versionedQuestion: async (
      parent,
      _: Record<PropertyKey, never>,
      context: MyContext
    ) => {
      const ref = 'QuestionCustomization.versionedQuestion chained resolver';
      if (isNullOrUndefined(parent?.questionId)) return null;

      const customization = await TemplateCustomization.findById(ref, context, parent.templateCustomizationId);
      if (isNullOrUndefined(customization)) return null;
      const versionedQuestion = await VersionedQuestion.findByVersionedTemplateIdAndQuestionId(
        ref,
        context,
        customization.currentVersionedTemplateId,
        parent.questionId
      );
      return versionedQuestion ?? null;
    },
    /**
     * Format the created date time
     * @param parent The QuestionCustomization
     * @returns the formatted date
     */
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    /**
     * Format the modified date time
     * @param parent The QuestionCustomization
     * @returns the formatted date time
     */
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },

  CustomQuestion: {
    /**
     * Format the created date time
     * @param parent The CustomQuestion
     * @returns the formatted date time
     */
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    /**
     * Format the modified date time
     * @param parent The CustomQuestion
     * @returns the formatted date time
     */
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  },
};
