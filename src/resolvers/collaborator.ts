import casual from "casual";
import { Resolvers } from "../types";
import { data as collaborators } from '../mocks/collaborator';
import { data as templates } from '../mocks/template';
import { data as users } from '../mocks/user';
import { TemplateCollaborator } from "../models/Collaborator";
import { Template } from "../models/Template";
import  { User, UserRole } from '../models/User';

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Query: {
    // Get all of the Users that belong to another affiliation that can edit the Template
    templateCollaborators: async (_, { templateId }) => {
      const nbrItems = Math.floor(Math.random() * collaborators.length);
      if (nbrItems <= 0) {
        return [];
      }

      const items = collaborators.slice(0, nbrItems);
      return await items.map(({ email, created, userId, invitedById }) => {
        return new TemplateCollaborator(templateId, email, invitedById, userId, created)
      });
    },
  },

  TemplateCollaborator: {
    template: async (parent: TemplateCollaborator) => {
      const { id, name, visibility, currentVersion, isDirty, created, modified } = templates[0];
      const tmplt = new Template(
        name, casual.url, parent.invitedById, visibility, currentVersion, isDirty, created, modified
      );
      tmplt.id = parent.templateId;
      return tmplt;
    },

    // Chained resolver to fetch the Affiliation info for the user
    invitedBy: async (parent: TemplateCollaborator) => {
      const userNbr = Math.floor(Math.random() * users.length);
      const { email, givenName, surName, affiliationId, orcid, created, modified } = users[userNbr];
      const user = new User({ email, givenName, surName, affiliationId, orcid, created, modified});
      user.id = parent.userId;
      user.role = UserRole.Admin;
      return user;
    },

    user: async (parent: TemplateCollaborator) => {
      if (parent.userId) {
        const userNbr = Math.floor(Math.random() * users.length);
        const { email, givenName, surName, affiliationId, orcid, created, modified } = users[userNbr];
        const user = new User({ email, givenName, surName, affiliationId, orcid, created, modified });
        user.id = parent.userId;
        user.role = UserRole.Admin;
        return user;
      }
      return null;
    },
  }
};
