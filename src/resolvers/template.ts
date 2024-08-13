import { Resolvers } from "../types";
import { logger, formatLogMessage } from "../logger";
import { Template } from "../models/Template";
import { User } from '../models/User';
import { MyContext } from "../context";
import { Affiliation } from "../models/Affiliation";

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Query: {
    // Get the Templates that belong to the current user's affiliation (user must be an Admin)
    templates: async (_, __, context: MyContext): Promise<Template[] | null> => {
      // TODO: perform a check here to make sure the User within the context is an Admin
      return Template.findByUser('templates resolver', context)
    },

    // Get the specified Template (user must be an Admin)
    template: async (_, { templateId }, context: MyContext): Promise<Template | null> => {
      // TODO: perform a check here to make sure the User within the context is an Admin
      return Template.findById('template resolver', context, templateId);
    },
  },

  Template: {
    // Chained resolver to fetch the Affiliation info for the user
    owner: async (parent: Template, _, context: MyContext) => {
      return Affiliation.findById('Chained Template.owner', context, parent.ownerId);
    },
  },
};
