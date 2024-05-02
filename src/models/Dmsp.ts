import { ContributorRoleModel } from './ContributorRole';

export type DmspModel = {
  id: string;
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

type PrimaryContact = {
  orcid: string;
  name: string;
  mbox: string;
  affiliation: Affiliation;
}

type Contributor = {
  orcid: string;
  name: string;
  mbox: string;
  role: [ContributorRoleModel]
  affiliation: Affiliation;
}

type Affiliation = {
  ror: string;
  name: string;
}
