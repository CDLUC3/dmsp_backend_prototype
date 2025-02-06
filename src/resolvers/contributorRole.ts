
import { formatLogMessage } from '../logger';
import { Resolvers } from "../types";
import { ContributorRole } from "../models/ContributorRole";
import { MyContext } from '../context';
import { isSuperAdmin } from '../services/authService';
import { AuthenticationError, ForbiddenError, InternalServerError } from '../utils/graphQLErrors';
import { GraphQLError } from 'graphql';

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: async (_, __, context: MyContext): Promise<ContributorRole[]> => {
      const reference = 'contributorRoles resolver';
      try {
        return await ContributorRole.all(reference, context);
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // returns a contributor role that matches the specified ID
    contributorRoleById: async (_, { contributorRoleId }, context: MyContext): Promise<ContributorRole> => {
      const reference = 'contributorRoleById resolver';
      try {
        return await ContributorRole.findById(reference, context, contributorRoleId);
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // returns the contributor role that matches the specified URL
    contributorRoleByURL: async (_, { contributorRoleURL }, context: MyContext): Promise<ContributorRole> => {
      const reference = 'contributorRoleByURL resolver';
      try {
        return await ContributorRole.findByURL(reference, context, contributorRoleURL);
      } catch (err) {
        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },

  Mutation: {
    // add a new ContributorRole
    addContributorRole: async (_, { url, label, displayOrder, description }, context) => {
      const reference = 'addContributorRole resolver';
      try {
        // If the current user is a superAdmin or an Admin and this is their Affiliation
        if (isSuperAdmin(context.token)) {
          const sql = 'INSERT INTO contributorRoles (url, label, description, displayOrder) VALUES (?, ?, ?)';
          const resp = await context.dataSources.sqlDataSource.query(context, sql, [url, label, description, displayOrder]);
          const created = await ContributorRole.findById(reference, context, resp.insertId);

          if (created?.id) {
            return created;
          }

          // A null was returned so add a generic error and return it
          const newRole = new ContributorRole({ url, label, description, displayOrder });
          if (!newRole.errors['general']) {
            newRole.addError('general', 'Unable to create Affiliation');
          }
          return newRole;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // update an existing ContributorRole
    updateContributorRole: async (_, { id, url, label, displayOrder, description }, context) => {
      const reference = 'updateContributorRole resolver';
      try {
        // If the current user is a superAdmin or an Admin and this is their Affiliation
        if (isSuperAdmin(context.token)) {
          const sql = 'UPDATE contributorRoles SET url = ?, label = ?, description = ?, displayOrder = ?) WHERE id = ?';
          await context.dataSources.sqlDataSource.query(context, sql, [url, label, description, displayOrder, id.toString()]);
          return await ContributorRole.findById(reference, context, id);
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },

    // remove a ContributorRole
    removeContributorRole: async (_, { id }, context) => {
      const reference = 'removeContributorRole resolver';
      const original = await ContributorRole.findById(reference, context, id);
      try {
        // If the current user is a superAdmin or an Admin and this is their Affiliation
        if (isSuperAdmin(context.token)) {
          const sql = 'DELETE FROM contributorRoles WHERE id = ?';
          await context.dataSources.sqlDataSource.query(context, sql, [id.toString()]);
          return original;
        }
        throw context?.token ? ForbiddenError() : AuthenticationError();
      } catch (err) {
        if (err instanceof GraphQLError) throw err;

        formatLogMessage(context).error(err, `Failure in ${reference}`);
        throw InternalServerError();
      }
    },
  },
};
