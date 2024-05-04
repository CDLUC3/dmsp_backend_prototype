import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';

import { orcidScalar } from './resolvers/scalars/orcid';

import { resolvers as contributorRoleResolvers } from './resolvers/contributorRole';
import { resolvers as dmspResolvers } from './resolvers/dmsp';

const scalarResolvers = {
  Orcid: orcidScalar
}

export const resolvers: IResolvers = mergeResolvers([
  scalarResolvers,
  dmspResolvers,
  contributorRoleResolvers
]);