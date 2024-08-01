import { Resolvers } from "../types";
import { data } from '../mocks/template';
import { TemplateModel } from "../models/Template";

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Query: {
    // Fetch all of the templates
    templates: async () => {
      return data.map((entry) => new TemplateModel(entry));
    },

    // Fetch a specific template
    template: async (_, { templateId }: { templateId: number }): Promise<TemplateModel | null> => {
      console.log(`Fetching template id: ${templateId}`);
      const template = data.find((entry) => entry.id === templateId);
      return template ? new TemplateModel(template) : null;
    },
  }
};
