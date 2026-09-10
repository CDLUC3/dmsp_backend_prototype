import {
  AddTemplateCustomizationInput,
  Resolvers,
  UpdateTemplateCustomizationInput
} from "../types.js";
import { authenticatedResolver } from "../services/authService.js";
import { MyContext } from "../context.js";
import { VersionedTemplate } from "../models/VersionedTemplate.js";
import { AdminNotification } from "../models/AdminNotifications.js";
import { isNullOrUndefined, normaliseDateTime } from "../utils/helpers.js";
import {
  TemplateCustomization, TemplateCustomizationOverview,
  TemplateCustomizationStatus
} from "../models/TemplateCustomization.js";
import { getValidatedCustomization } from "../services/templateCustomizationService.js";
import { InternalServerError, NotFoundError } from "../utils/graphQLErrors.js";
import { UserRole } from "../models/User.js";
import { Affiliation } from "../models/Affiliation.js";

export const resolvers: Resolvers = {
  Query: {
    /**
     * ADMIN ONLY: Fetch an overview of the TemplateCustomization including the
     * funder's sections and questions splicing in any custom sections and questions
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the TemplateCustomization
     * @param context The Apollo context
     * @returns The an overview of the TemplateCustomization (with errors if applicable)
     * @throws NotFoundError when the TemplateCustomization was not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    templateCustomizationOverview: authenticatedResolver(
      'templateCustomizationOverview resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { templateCustomizationId }: { templateCustomizationId: number },
        context: MyContext
      ): Promise<TemplateCustomizationOverview | null> => {
        const reference = 'templateCustomization resolver';

        const customization = await TemplateCustomizationOverview.generateOverview(
          reference,
          context,
          templateCustomizationId
        );
        if (!customization) throw NotFoundError();

        // Find the parent template customization and verify the user has access.
        // This will throw a forbidden error if they do not.
        await getValidatedCustomization(
          reference,
          context,
          templateCustomizationId
        );

        return customization;
      }),
  },

  Mutation: {
    /**
     * ADMIN ONLY: Create a TemplateCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the TemplateCustomization
     * @param context The Apollo context
     * @returns The an overview of the new TemplateCustomization (with errors if applicable)
     * @throws NotFoundError when the TemplateCustomization was not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    addTemplateCustomization: authenticatedResolver(
      'addTemplateCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: AddTemplateCustomizationInput },
        context: MyContext
      ): Promise<TemplateCustomizationOverview> => {
        const reference = 'addTemplateCustomization resolver';
        const { versionedTemplateId, status } = input;

        // Fetch the versioned funder template
        const versionedTemplate = await VersionedTemplate.findById(
          reference,
          context,
          versionedTemplateId
        );
        if (!versionedTemplate || isNullOrUndefined(versionedTemplate.id)) throw NotFoundError();

        const customization = new TemplateCustomization({
          affiliationId: context.token.affiliationId,
          templateId: versionedTemplate.templateId,
          currentVersionedTemplateId: versionedTemplate.id,
          status: status as unknown as TemplateCustomizationStatus
        });

        // Save the new template customization
        const created = await customization.create(context);

        // If there were no problems, then generate the overview and return it
        if (!isNullOrUndefined(created) && !isNullOrUndefined(created.id)) {
          const overview = await TemplateCustomizationOverview.generateOverview(
            reference,
            context,
            created.id
          );
          if (isNullOrUndefined(overview)) throw InternalServerError();

          // Transfer any errors encountered during the creation to the Overview
          overview.errors = created.errors;
          return overview;
        }
        throw InternalServerError();
      }),

    /**
     * ADMIN ONLY: Update the specified TemplateCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the TemplateCustomization
     * @param context The Apollo context
     * @returns The an overview of the TemplateCustomization (with errors if applicable)
     * @throws NotFoundError when the TemplateCustomization was not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    updateTemplateCustomization: authenticatedResolver(
      'updateTemplateCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { input }: { input: UpdateTemplateCustomizationInput },
        context: MyContext
      ): Promise<TemplateCustomizationOverview> => {
        const reference = 'updateTemplateCustomization resolver';
        const { templateCustomizationId, status } = input;

        const customization = await getValidatedCustomization(
          reference,
          context,
          templateCustomizationId
        );
        if (!customization) throw NotFoundError();

        // Update the customization (leave the status unchanged if none was provided)
        if (!isNullOrUndefined(status)) {
          customization.status = TemplateCustomizationStatus[status];
        }
        const updated = await customization.update(context);

        if (!isNullOrUndefined(updated) && !isNullOrUndefined(updated.id)) {
          const overview = await TemplateCustomizationOverview.generateOverview(
            reference,
            context,
            updated.id
          );
          if (isNullOrUndefined(overview)) throw InternalServerError();

          // Transfer any errors encountered during the update to the Overview
          overview.errors = updated.errors;
          return overview;
        }
        throw InternalServerError();
      }),

    /**
     * ADMIN ONLY: Delete the specified TemplateCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the TemplateCustomization
     * @param context The Apollo context
     * @returns The an overview of the original TemplateCustomization (with errors if applicable)
     * @throws NotFoundError when the TemplateCustomization was not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    removeTemplateCustomization: authenticatedResolver(
      'removeTemplateCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { templateCustomizationId }: { templateCustomizationId: number },
        context: MyContext
      ): Promise<TemplateCustomization> => {
        const reference = 'removeTemplateCustomization resolver';

        const customization = await getValidatedCustomization(
          reference,
          context,
          templateCustomizationId
        );
        if (!customization) throw NotFoundError();

        const deleted = await customization.delete(context);
        return deleted ?? customization;
      }),

    /**
     * ADMIN ONLY: Publish the specified TemplateCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the TemplateCustomization
     * @param context The Apollo context
     * @returns The an overview of the TemplateCustomization (with errors if applicable)
     * @throws NotFoundError when the TemplateCustomization was not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    publishTemplateCustomization: authenticatedResolver(
      'publishTemplateCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { templateCustomizationId }: { templateCustomizationId: number },
        context: MyContext
      ): Promise<TemplateCustomizationOverview> => {
        const reference = 'publishTemplateCustomization resolver';

        const customization = await getValidatedCustomization(
          reference,
          context,
          templateCustomizationId
        );
        if (!customization) throw NotFoundError();

        const published = await customization.publish(context);

        if (!isNullOrUndefined(published) && !isNullOrUndefined(published.id)) {
          const overview = await TemplateCustomizationOverview.generateOverview(
            reference,
            context,
            published.id
          );
          if (isNullOrUndefined(overview)) throw InternalServerError();

          const affiliationId = context.token.affiliationId;
          if (!affiliationId) {
            throw NotFoundError(`Affiliation for user not found`);
          }

          const affiliation = await Affiliation.findByURI(reference, context, affiliationId);

          // Notify all org admins when customization changes are published
          if (published?.id && !isNullOrUndefined(affiliation) && !isNullOrUndefined(affiliation.uri)) {
            await AdminNotification.addNotificationForAffiliation(
              reference,
              context,
              affiliation.uri,
              'TEMPLATE_CUSTOMIZATION_CHANGED',
              { templateCustomizationId: published.id }
            );

          }
          // Transfer any errors
          overview.errors = published.errors;
          return overview;
        }
        throw InternalServerError();
      }),

    /**
     * ADMIN ONLY: Unpublish the specified TemplateCustomization
     *
     * @param _ Ignored, this is the entrypoint for the Apollo resolver
     * @param args the identifier of the TemplateCustomization
     * @param context The Apollo context
     * @returns The an overview of the TemplateCustomization (with errors if applicable)
     * @throws NotFoundError when the TemplateCustomization was not found
     * @throws ForbiddenError when the caller does not have permission
     * @throws UnauthorizedError when the JWT token is not present
     * @throws InternalServerError when a fatal error has occurred
     */
    unpublishTemplateCustomization: authenticatedResolver(
      'unpublishTemplateCustomization resolver',
      UserRole.ADMIN,
      async (
        _: Record<PropertyKey, never>,
        { templateCustomizationId }: { templateCustomizationId: number },
        context: MyContext
      ): Promise<TemplateCustomizationOverview> => {
        const reference = 'unpublishTemplateCustomization resolver';
        const customization = await getValidatedCustomization(
          reference,
          context,
          templateCustomizationId
        );
        if (!customization) throw NotFoundError();

        const unpublished = await customization.unpublish(context);

        if (!isNullOrUndefined(unpublished) && !isNullOrUndefined(unpublished.id)) {
          const overview = await TemplateCustomizationOverview.generateOverview(
            reference,
            context,
            unpublished.id
          );
          if (isNullOrUndefined(overview)) throw InternalServerError();

          // Transfer any errors
          overview.errors = unpublished.errors;
          return overview;
        }
        throw InternalServerError();
      }),
  },

  TemplateCustomization: {
    /**
     * Format the date time the customization was last published
     * @param parent The TemplateCustomization
     * @returns the formatted date
     */
    latestPublishedDate: (parent) => {
      return normaliseDateTime(parent.latestPublishedDate);
    },
    /**
     * Format the created date time
     * @param parent The TemplateCustomization
     * @returns the formatted date
     */
    created: (parent) => {
      return normaliseDateTime(parent.created);
    },
    /**
     * Format the modified date time
     * @param parent The TemplateCustomization
     * @returns the formatted date
     */
    modified: (parent) => {
      return normaliseDateTime(parent.modified);
    }
  }
};
