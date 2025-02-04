
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { DEFAULT_DMPTOOL_LICENSE_URL, License } from "../models/License";
import { MyContext } from '../context';
import { isAdmin, isAuthorized, isSuperAdmin } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError, NotFoundError } from '../utils/graphQLErrors';

export const resolvers: Resolvers = {
  Query: {
    // searches the metadata standards table or returns all standards if no critieria is specified
    licenses: async (_, { term }, context: MyContext): Promise<License[]> => {
      return await License.search('licenses resolver', context, term);
    },
    recommendedLicenses: async (_, { recommended }, context: MyContext): Promise<License[]> => {
      return await License.recommended('recommendedLicenses resolver', context, recommended);
    },
    license: async (_, { uri }, context: MyContext): Promise<License> => {
      return await License.findByURI('license resolver', context, uri);
    },
  },

  Mutation: {
    // add a new ContributorRole
    addLicense: async (_, { name, uri, description, recommended }, context: MyContext) => {
      if (isAdmin(context.token)) {
        try {
          const newLicense = new License({ name, uri, description, recommended});
          return await newLicense.create(context);
        } catch(err) {
          formatLogMessage(context).error(err, 'Failure in addLicense resolver');
          throw InternalServerError();
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
    updateLicense: async (_, { uri, name, description, recommended }, context) => {
      // If the user is a an admin and its a DMPTool added standard (no updates to standards managed elsewhere!)
      if (isAdmin(context.token) && uri.startsWith(DEFAULT_DMPTOOL_LICENSE_URL)) {
        try {
          const license = await License.findByURI('updateLicense resolver', context, uri);
          if (!license) throw NotFoundError();

          const toUpdate = new License({ id: license.id, uri: license.uri, name, description, recommended });
          return await toUpdate.update(context);
        } catch(err) {
          formatLogMessage(context).error(err, 'Failure in updateLicense resolver');
          throw InternalServerError();
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
    removeLicense: async (_, { uri }, context) => {
      // If the user is a an admin and its a DMPTool added standard (no removals of standards managed elsewhere!)
      if (isAdmin(context.token) && uri.startsWith(DEFAULT_DMPTOOL_LICENSE_URL)) {
        try {
          const license = await License.findByURI('removeLicense resolver', context, uri);
          if (!license) throw NotFoundError();

          // TODO: We should do a check to see if it has been used and then either NOT allow the deletion
          //       or notify that it is being done and to what DMPs
          return await license.delete(context);
        } catch(err) {
          formatLogMessage(context).error(err, 'Failure in removeLicense resolver');
          throw InternalServerError();
        }
      }
      throw context?.token ? ForbiddenError() : AuthenticationError();
    },
    mergeLicenses: async (_, { licenseToKeepId, licenseToRemoveId }, context) => {
      if (isSuperAdmin(context.token)) {
        const reference = 'mergeLicenses resolver';
        try {
          const toKeep = await License.findById(reference, context, licenseToKeepId);
          const toRemove = await License.findById(reference, context, licenseToRemoveId);

          if (!toKeep || !toRemove) {
            throw NotFoundError();
          }
          //No removals of licenses managed elsewhere!
          if (!toRemove.uri.startsWith(DEFAULT_DMPTOOL_LICENSE_URL)) {
            throw ForbiddenError();
          }

          // Only modify the one we want to keep if it is a DMP Tool managed licenses!
          if (!toKeep.uri.startsWith(DEFAULT_DMPTOOL_LICENSE_URL)) {
            // Merge the description in if the one we want to keep does not have one
            if (!toKeep.description) {
              toKeep.description = toRemove.description
            }
            // If the one being removed is recommended then make sure the one we keep is recommended
            if (toRemove.recommended) {
              toKeep.recommended = true;
            }
            await toKeep.update(context);
          }

          // TODO: We will need to update the identifiers for any project outputs that ref the one being removed!

          // Delete the one we want to remove
          await toRemove.delete(context);
          return toKeep;
        } catch(err) {
          formatLogMessage(context).error(err, 'Failure in removeLicense resolver');
          throw InternalServerError();
        }
      } else {
        throw ForbiddenError();
      }
    },
  },
};
