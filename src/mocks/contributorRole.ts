import casual from 'casual';
import { mockDate, mockError, mockSuccess } from '../mocks';
import {
  ContributorRole,
  QueryContributorRoleByIdArgs,
  QueryContributorRoleByUrlArgs
} from '../types';

// Just define what is unique here. Any fields you skip will end up using the defaults
// for their respective type as defined in ./src/mocks.ts
const data: ContributorRole[] = [
  {
    id: '1',
    displayOrder: 1,
    url: 'https://credit.niso.org/contributor-roles/investigation/',
    label: 'Principal Investigator (PI)',
    description: 'An individual conducting a research and investigation process, specifically performing the experiments, or data/evidence collection.',
    created: mockDate,
    modified: mockDate
  },
  {
    id: '2',
    url: 'https://credit.niso.org/contributor-roles/project-administration/',
    label: 'Project Administrator',
    description: 'An individual with management and coordination responsibility for the research activity planning and execution.',
    displayOrder: 2,
    created: mockDate,
    modified: mockDate
  },
  {
    id: '3',
    url: 'https://credit.niso.org/contributor-roles/data-curation/',
    label: 'Data Manager',
    description: 'An individual engaged in management activities to annotate (produce metadata), scrub data and maintain research data (including software code, where it is necessary for interpreting the data itself) for initial use and later re-use.',
    displayOrder: 3,
    created: mockDate,
    modified: mockDate
  },
  {
    id: '4',
    url: `${process.env.DMSP_BASE_URL}/contributor_roles/other`,
    label: 'Other',
    description: 'An individual associated with the research project that does not fall under one of the other primary roles.',
    displayOrder: 4,
    created: mockDate,
    modified: mockDate
  },
]

export const mock = {
  // Return a random item from the data array
  ContributorRole: () => data[Math.floor(Math.random() * data.length)],

  Query: {
    // returns an array of all contributor roles
    contributorRoles: () => data,

    contributorRoleById: (_parent: any, args: QueryContributorRoleByIdArgs): ContributorRole | null => {
      const { contributorRoleId } = args.contributorRoleId;
      return data.find((item) => item.id === contributorRoleId) || null;
    },

    contributorRoleByURL: (_parent: any, args: QueryContributorRoleByUrlArgs): ContributorRole | null => {
      const { contributorRoleURL } = args.contributorRoleURL;
      return data.find((item) => item.url?.toLowerCase() === contributorRoleURL.toLowerCase()) || null;
    },
  },
}
