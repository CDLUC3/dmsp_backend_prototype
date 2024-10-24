import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';

import { dmspIdScalar } from './resolvers/scalars/dmspId';
import { orcidScalar } from './resolvers/scalars/orcid';
import { rorScalar } from './resolvers/scalars/ror';

import { resolvers as affiliationResolvers } from './resolvers/affiliation';
import { resolvers as collaboratorResolvers } from './resolvers/collaborator';
import { resolvers as contributorRoleResolvers } from './resolvers/contributorRole';
import { resolvers as languageResolvers } from './resolvers/language';
import { resolvers as sectionResolvers } from './resolvers/section';
import { resolvers as tagResolvers } from './resolvers/tag';
import { resolvers as versionedSectionResolvers } from './resolvers/versionedSection';
import { resolvers as dmspResolvers } from './resolvers/dmsp';
import { resolvers as templateResolvers } from './resolvers/template';
import { resolvers as userResolvers } from './resolvers/user';
import { resolvers as versionedTemplateResolvers } from './resolvers/versionedTemplate';

const scalarResolvers = {
  DmspId: dmspIdScalar,
  Orcid: orcidScalar,
  Ror: rorScalar
}

export const resolvers: IResolvers = mergeResolvers([
  scalarResolvers,
  affiliationResolvers,
  collaboratorResolvers,
  languageResolvers,
  sectionResolvers,
  tagResolvers,
  versionedSectionResolvers,
  dmspResolvers,
  contributorRoleResolvers,
  templateResolvers,
  userResolvers,
  versionedTemplateResolvers,
]);
