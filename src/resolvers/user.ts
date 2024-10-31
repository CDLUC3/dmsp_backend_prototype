import { Resolvers } from "../types";
import { MyContext } from '../context';
import { User } from '../models/User';
import { UserEmail } from "../models/UserEmail";
import { Affiliation } from '../models/Affiliation';
import { isAdmin, isAuthorized, isSuperAdmin } from "../services/authService";
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/graphQLErrors";
import { defaultLanguageId } from "../models/Language";
import { anonymizeUser, mergeUsers } from "../services/userService";

export const resolvers: Resolvers = {
  Query: {
    // returns the current User
    me: async (_, __, context: MyContext): Promise<User> => {
      if (isAuthorized(context?.token)) {
        return await User.findByEmail('me resolver', context, context.token.email);
      }
      throw AuthenticationError();
    },

    // Should only be callable by an Admin. Super returns all users, Admin gets only
    // the users associated with their affiliationId
    users: async (_, __, context): Promise<User[]> => {
      if (isAdmin(context.token)) {
        return await User.findByAffiliationId('users resolver', context, context.token.affiliationId);
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },

    // This query should only be available to Admins. Super can get any user and Admin can get
    // only users associated with their affiliationId
    user: async (_, { userId }, context: MyContext): Promise<User> => {
      if (isAdmin(context.token)) {
        const user = await User.findById('user resolver', context, userId);
        if (!user) {
          throw NotFoundError();
        }
        // Make sure the Admin is from the same Affiliation or the user is a SuperAdmin
        if (context.token?.affiliationId === user.affiliationId || await isSuperAdmin(context.token)) {
          return user;
        }
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
  },

  Mutation: {
    // Update the current user's information
    updateUserProfile: async (_, { input: {
      givenName,
      surName,
      affiliationId,
      languageId,
    } }, context: MyContext): Promise<User> => {
      if (isAuthorized(context?.token)) {
        const user = await User.findById('updateUserProfile resolver', context, context.token.id);
        // Only continue if the user is active and not locked
        if (!user || !user.active || user.locked) {
          throw ForbiddenError();
        }

        user.givenName = givenName;
        user.surName = surName;
        user.affiliationId = affiliationId;
        user.languageId = languageId || defaultLanguageId;
        const updated = await new User(user).update(context);
        if (!updated) {
          throw InternalServerError('Unable to save the profile changes at this time');
        }
        return updated;
      }
      // Unauthenticated
      throw AuthenticationError();
    },
    // Update the current user's email notifications
    updateUserNotifications: async (_, { input: {
      notify_on_comment_added,
      notify_on_template_shared,
      notify_on_feedback_complete,
      notify_on_plan_shared,
      notify_on_plan_visibility_change,
    } }, context: MyContext): Promise<User> => {
      if (isAuthorized(context?.token)) {
        const user = await User.findById('updateUserNotifiactions resolver', context, context.token.id);
        // Only continue if the user is active and not locked
        if (!user || !user.active || user.locked) {
          throw ForbiddenError();
        }

        user.notify_on_comment_added = notify_on_comment_added || true;
        user.notify_on_template_shared = notify_on_template_shared || true;
        user.notify_on_feedback_complete = notify_on_feedback_complete || true;
        user.notify_on_plan_shared = notify_on_plan_shared || true;
        user.notify_on_plan_visibility_change = notify_on_plan_visibility_change || true;
        const updated = await new User(user).update(context);
        if (!updated) {
          throw InternalServerError('Unable to save the notification settings at this time');
        }
        return updated;
      }
      // Unauthenticated
      throw AuthenticationError();
    },
    // Anonymize the current user's account (essentially deletes their account without orphaning things)
    removeUser: async (_, __, context: MyContext): Promise<User> => {
      if (isAuthorized(context?.token)) {
        const user = await User.findById('removeUser resolver', context, context.token.id);
        // Only continue if the user is active and not locked
        if (!user || !user.active || user.locked) {
          throw ForbiddenError();
        }
        if (await anonymizeUser(context, user)) {
          return user;
        }
        throw InternalServerError('Unable to remove your account at this time');
      }
      // Unauthenticated
      throw AuthenticationError();
    },

    // Set the user's ORCID
    setUserOrcid: async (_, { orcid }, context: MyContext): Promise<User> => {
      if (isAuthorized(context?.token)) {
        const user = await User.findById('setUserOrcid resolver', context, context.token.id);
        // Only continue if the user is active and not locked
        if (!user || !user.active || user.locked) {
          throw ForbiddenError();
        }

        user.orcid = orcid;
        const updated = await new User(user).update(context);
        if (!updated) {
          throw InternalServerError('Unable to save the ORCID at this time');
        }
        return updated;
      }
      // Unauthenticated
      throw AuthenticationError();
    },
    // Add an email address for the current user
    addUserEmail: async (_, { email, isPrimary }, context: MyContext): Promise<UserEmail> => {
      if (isAuthorized(context?.token)) {
        const user = await User.findById('addUserEmail resolver', context, context.token.id);
        // Only continue if the user is active and not locked
        if (!user || !user.active || user.locked) {
          throw ForbiddenError();
        }
        const userEmail = new UserEmail({
          userId: context.token.id,
          email: email,
          isPrimary: isPrimary || false,
        });
        const created = userEmail.create(context);
        if (!created) {
          throw InternalServerError('Could not add the email at this time');
        }
        return userEmail;
      }
      // Unauthenticated
      throw AuthenticationError();
    },
    // Remove an email address from the current user
    removeUserEmail: async (_, { email }, context: MyContext): Promise<UserEmail> => {
      const ref = 'removeUserEmail resolver';
      if (isAuthorized(context?.token)) {
        const user = await User.findById(ref, context, context.token.id);
        // Only continue if the user is active and not locked
        if (!user || !user.active || user.locked) {
          throw ForbiddenError();
        }

        const userEmail = await UserEmail.findByUserIdAndEmail(ref, context, context.token.id, email);
        if (!userEmail) {
          throw NotFoundError();
        }

        const original = structuredClone(userEmail);
        if (await new UserEmail(userEmail).delete(context)) {
          return original;
        }
        throw InternalServerError('Unable to remove the email at this time');
      }
      // Unauthenticated
      throw AuthenticationError();
    },
    // Designate the email as the current user's primary email address
    setPrimaryUserEmail: async (_, { email }, context: MyContext): Promise<UserEmail[]> => {
      const ref = 'setPrimaryUserEmail resolver';
      if (isAuthorized(context?.token)) {
        const user = await User.findById(ref, context, context.token.id);
        // Only continue if the user is active and not locked
        if (!user || !user.active || user.locked) {
          throw ForbiddenError();
        }

        const userEmails = await UserEmail.findByUserId(ref, context, context.token.id);

        const existing = userEmails.find((entry) => { return entry.email === email });
        const oldPrimary = userEmails.find((entry) => { return entry.isPrimary === true });
        if (!existing) {
          throw NotFoundError();
        }

        if (oldPrimary) {
          oldPrimary.isPrimary = false;
          await new UserEmail(oldPrimary).update(context);
        }

        existing.isPrimary = true;
        const updated = await new UserEmail(existing).update(context);
        if (updated && (!updated.errors || (Array.isArray(updated.errors) && updated.errors.length === 0))) {
          user.email = email;
          if (await User.update(context, new User(user).tableName, user, ref, ['password'])) {
            return await UserEmail.findByUserId(ref, context, user.id);
          }
        } else {
          return [updated];
        }

        throw InternalServerError('Unable to remove the email at this time');
      }
      // Unauthenticated
      throw AuthenticationError();
    },

    // Change the current user's password
    updatePassword: async (_, { oldPassword, newPassword }, context: MyContext): Promise<User> => {
      if (isAuthorized(context?.token)) {
        const user = await User.findById('updatePassword resolver', context, context.token.id);
        // Only continue if the user is active and not locked
        if (!user || !user.active || user.locked) {
          throw ForbiddenError();
        }

        const updated = await new User(user).updatePassword(context, oldPassword, newPassword);
        if (updated) {
          return updated;
        }
      }
      // Unauthenticated
      throw AuthenticationError();
    },

    // Deactivate the specified user Account (Admin only)
    deactivateUser: async (_, { userId }, context: MyContext): Promise<User> => {
      const ref = 'deactivateUser resolver';
      if (isAdmin(context.token)) {
        const result = await User.findById(ref, context, userId);
        // For some reason these are being returned a Objects and not User!
        const user = new User(result);
        // Only continue if the current user's affiliation matches the user OR they are SuperAdmin
        if (context.token.affiliationId === user.affiliationId || isSuperAdmin(context.token)) {
          user.active = false;
          const updated = await User.update(context, new User(user).tableName, user, ref, ['password']);

          if (!updated) {
            throw InternalServerError('Unable to deactivate the user at this time');
          }
          // Return the result, because updated will not return a User since they are now inactive
          return result as User;
        }
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
    // Reactivate the specified user Account (Admin only)
    activateUser: async (_, { userId }, context: MyContext): Promise<User> => {
      const ref = 'activateUser resolver';
      if (isAdmin(context.token)) {
        const result = await User.findById(ref, context, userId);
        // For some reason these are being returned a Objects and not User!
        const user = new User(result);
        // Only continue if the current user's affiliation matches the user OR they are SuperAdmin
        if (context.token.affiliationId === user.affiliationId || isSuperAdmin(context.token)) {
          user.active = true;
          const updated = await User.update(context, user.tableName, user, ref, ['password']);

          if (!updated) {
            throw InternalServerError('Unable to activate the user at this time');
          }
          return result as User;
        }
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
    // Merge the 2 user accounts (Admin only)
    mergeUsers: async (_, { userIdToBeMerged, userIdToKeep }, context: MyContext): Promise<User> => {
      if (isAdmin(context.token)) {
        const userToMerge = await User.findById('mergeUsers resolver', context, userIdToBeMerged);
        const userToKeep = await User.findById('mergeUsers resolver', context, userIdToKeep);
        // Only continue if the current user's affiliation matches the user OR they are SuperAdmin
        const affil = context.token.affiliationId;
        if (
          (affil === userToMerge.affiliationId && affil === userToKeep.affiliationId) ||
          isSuperAdmin(context.token)
        ) {
          const merged = await mergeUsers(context, userToMerge, userToKeep);
          if (!merged) {
            throw InternalServerError('Unable to merge the users at this time');
          }
          return merged;
        }
      }
      // Unauthorized!
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
  },

  User: {
    // Chained resolver to fetch the Affiliation info for the user
    affiliation: async (parent: User, _, context): Promise<Affiliation> => {
      return await Affiliation.findByURI('Chained User.affiliation', context, parent.affiliationId);
    },
    // Chained resolver to fetch the secondary email addresses
    emails: async (parent: User, _, context): Promise<UserEmail[]> => {
      return await UserEmail.findByUserId('Chained User.emails', context, parent.id);
    },
  },
};
