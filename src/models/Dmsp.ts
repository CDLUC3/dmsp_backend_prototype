import { ContributorRoleModel } from './ContributorRole';

export interface DmspModel {
  primaryContact: PrimaryContact;
  created: string;
  modified: string;
  title: string;

  contributors: [Contributor];
  description: string;
  isFeatured: string;
  visibility: string;
  hasEthicalConcerns: string;
  ethicalConcernsDescription: string;
  ethicalConcernsReportURL: string;
  language: string;
}

interface PrimaryContact {
  orcid: string;
  name: string;
  mbox: string;
  affiliation: Affiliation;
}

interface Contributor {
  orcid: string;
  name: string;
  mbox: string;
  role: [ContributorRoleModel]
  affiliation: Affiliation;
}

interface Affiliation {
  ror: string;
  name: string;
  affiliation_id: string;
}
