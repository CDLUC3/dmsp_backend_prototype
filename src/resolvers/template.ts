import { Resolvers } from "../types";
import { mockRor, data as affiliations } from '../mocks/affiliation';
import { data as users } from '../mocks/user';
import { AffiliationModel } from '../models/Affiliation';
import { Template } from "../models/Template";
import { User, UserRole } from '../models/User';

// TODO: Convert this to use the MySQL DataSource that is passed in via the Apollo server
//       context once we are happy with the schema.
export const resolvers: Resolvers = {
  Template: {
    // Chained resolver to fetch the Affiliation info for the user
    affiliation: async (parent: Template) => {
      const nbr = Math.floor(Math.random() * users.length);
      const { name, displayName, active, funder, fundref, domain, aliases, acronyms, countryCode, countryName } = affiliations[nbr];
      const affiliation = new AffiliationModel({
        name, displayName, active, funder, fundref, domain, aliases, acronyms, countryCode, countryName
      });
      affiliation.id = mockRor();
      return affiliation;
    },

    owner: async (parent: Template) => {
      const userNbr = Math.floor(Math.random() * users.length);
      const { email, givenName, surName, affiliationId, orcid, created, modified } = users[userNbr];
      const user = new User({ email, givenName, surName, affiliationId, orcid, created, modified});
      user.id = parent.ownerId;
      user.role = UserRole.Admin;
      return user;
    },
  }
};
