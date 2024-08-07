import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';

import { dmspIdScalar } from './resolvers/scalars/dmspId';
import { orcidScalar } from './resolvers/scalars/orcid';
import { rorScalar } from './resolvers/scalars/ror';

import { resolvers as contributorRoleResolvers } from './resolvers/contributorRole';
import { resolvers as dmspResolvers } from './resolvers/dmsp';
import { resolvers as templateResolvers } from './resolvers/template';
import { resolvers as userResolvers } from './resolvers/user';

const scalarResolvers = {
  DmspId: dmspIdScalar,
  Orcid: orcidScalar,
  Ror: rorScalar
}

export const resolvers: IResolvers = mergeResolvers([
  scalarResolvers,
  contributorRoleResolvers,
  dmspResolvers,
  templateResolvers,
  userResolvers,
]);