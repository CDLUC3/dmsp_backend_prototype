import { Resolvers } from "../types";
import { MockMySQLTable } from './MockMySQLTable';
// import { ContributorRole, ContributorRoleMutationResponse } from '../types';

// Seed records for the ContributorRoles table
const mockItems = [
  {
    displayOrder: 1,
    url: 'https://credit.niso.org/contributor-roles/investigation/',
    label: 'Principal Investigator (PI)',
    description: 'An individual conducting a research and investigation process, specifically performing the experiments, or data/evidence collection.',
  },
  {
    url: 'https://credit.niso.org/contributor-roles/project-administration/',
    label: 'Project Administrator',
    description: 'An individual with management and coordination responsibility for the research activity planning and execution.',
    displayOrder: 2,
  },
  {
    url: 'https://credit.niso.org/contributor-roles/data-curation/',
    label: 'Data Manager',
    description: 'An individual engaged in management activities to annotate (produce metadata), scrub data and maintain research data (including software code, where it is necessary for interpreting the data itself) for initial use and later re-use.',
    displayOrder: 3,
  },
  {
    url: `${process.env.DMSP_BASE_URL}/contributor_roles/other`,
    label: 'Other',
    description: 'An individual associated with the research project that does not fall under one of the other primary roles.',
    displayOrder: 4,
  },
]
export const mockStore = new MockMySQLTable(mockItems);

export const resolvers: Resolvers = {
  Query: {
    // returns an array of all contributor roles
    contributorRoles: (_, __, { mockStores }) => {
      return mockStores.contributorRoles.items();
    },

    // No idea why this does not work without including `_other` here. Results in a Typescript error
    // contributorRoleById: ({ contributorRoleId }: { contributorRoleId: string }, _other): ContributorRole | null => {
      contributorRoleById: (_, { contributorRoleId }, { mockStores }) => {
      return mockStores.contributorRoles.findItemById(contributorRoleId);
    },

    // contributorRoleByURL: ({ contributorRoleURL }: { contributorRoleURL: string }, _other): ContributorRole | null => {
    contributorRoleByURL: (_, { contributorRoleURL }, { mockStores }) => {
      return mockStores.contributorRoles.findItemByProperty('url', contributorRoleURL);
    },
  },

  Mutation: {
    // addContributorRole: (args, _other): ContributorRoleMutationResponse => {
    addContributorRole: (_, args, { mockStores }) => {
      const existing = mockStores.contributorRoles.findItemByProperty('url', args?.url);
      if (existing) {
        return mockStores.contributorRoles.getMutationError(400, 'ContributorRole already exists!');

      } else {
        const newItem = mockStores.contributorRoles.addItem(args);
        if (newItem) {
          const resp = mockStores.contributorRoles.getMutationSuccess(201, `Successfully added ContributorRole ${newItem.id}`);
          return {
            contributorRole: newItem,
            ...resp
          }
        }
        return mockStores.contributorRoles.getMutationError(500, 'Unable to add the ContributorRole!!');
      }
    },

    // updateContributorRole: (args, _other): ContributorRoleMutationResponse => {
    updateContributorRole: (_, args, { mockStores }) => {
      const updated = mockStores.contributorRoles.updateItem(args);
      if (updated) {
        const resp = mockStores.contributorRoles.getMutationSuccess(200, `Successfully update ContributorRole ${args?.id}`);
        return {
          contributorRole: updated,
          ...resp
        }
      }
      return mockStores.contributorRoles.getMutationError(500, 'Unable to update the ContributorRole!!');
    },

    // removeContributorRole: (args, _other): ContributorRoleMutationResponse => {
    removeContributorRole: (_, { id }, { mockStores }) => {
      let existing = mockStores.contributorRoles.findItemById(id);
      if (!existing) {
        return mockStores.contributorRoles.getMutationError(404, 'ContributorRole does not exist!');

      } else {
        const success = mockStores.contributorRoles.removeItem(id);
        if (success) {
          const resp = mockStores.contributorRoles.getMutationSuccess(200, `Successfully removed ContributorRole ${id}`);
          return {
            contributorRole: existing,
            ...resp
          }
        }
        return mockStores.contributorRoles.getMutationError(500, 'Unable to remove the ContributorRole!!');
      }
    },
  }
}
