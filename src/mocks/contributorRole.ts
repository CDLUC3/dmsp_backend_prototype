import { prepareNewMySQLRecord, prepareUpdatedMySQLRecord, mockError, mockSuccess } from '../mocks';
import { ContributorRole, ContributorRoleMutationResponse } from '../types';

// Seed records for the ContributorRoles table
const recs = [
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

// Pass the mockRecords through our helper method that will assign the ID and other boilerplate fields
// that our MySQL uses like `created` and `modified`
const data: ContributorRole[] = recs.map((rec, idx) => {
  return prepareNewMySQLRecord({ id: (idx + 1).toString(), ...rec });
});

export const mock = {
  // Return a random item from the data array
  ContributorRole: () => data[Math.floor(Math.random() * data.length)],

  Query: {
    // returns an array of all contributor roles
    contributorRoles: () => data,

    // No idea why this does not work without including `_other` here. Results in a Typescript error
    contributorRoleById: ({ contributorRoleId }: { contributorRoleId: string }, _other): ContributorRole | null => {
      console.log(contributorRoleId);
      return data.find((item) => item.id === contributorRoleId) || null;
    },

    contributorRoleByURL: ({ contributorRoleURL }: { contributorRoleURL: string }, _other): ContributorRole | null => {
      return data.find((item) => item.url?.toLowerCase() === contributorRoleURL.toLowerCase()) || null;
    },
  },

  Mutation: {
    addContributorRole: (args, _other): ContributorRoleMutationResponse => {
      const existing = data.find((item) => item.url?.toLowerCase() === args?.url?.toLowerCase()) || null;
      if (existing) {
        return mockError(400, 'ContributorRole already exists!');

      } else {
        const newContributorRole = prepareNewMySQLRecord(args);
        data.push(newContributorRole);

        const successResponse = mockSuccess(201, `Successfully added ContributorRole ${newContributorRole.id}`);
        return {
          contributorRole: newContributorRole,
          ...successResponse
        }
      }
    },

    updateContributorRole: (args, _other): ContributorRoleMutationResponse => {
      let existing = data.find((item) => item.id?.toLowerCase() === args?.id?.toLowerCase()) || null;
      if (!existing) {
        return mockError(404, 'ContributorRole does not exist!');

      } else {
        existing = prepareUpdatedMySQLRecord({ ...existing, ...args });

        const successResponse = mockSuccess(200, `Successfully update ContributorRole ${args?.id}`);
        return {
          contributorRole: existing,
          ...successResponse
        }
      }
    },

    removeContributorRole: (args, _other): ContributorRoleMutationResponse => {
      let existing = data.find((item) => item.id?.toLowerCase() === args?.id?.toLowerCase()) || null;
      if (!existing) {
        return mockError(404, 'ContributorRole does not exist!');

      } else {
        const idx = data.indexOf(existing);
        delete data[idx];

        const successResponse = mockSuccess(200, `Successfully deleted ContributorRole ${args?.id}`);
        return {
          contributorRole: existing,
          ...successResponse
        }
      }
    },
  }
}
