import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';

import { resolvers as ContributorRoleResolvers } from './ContributorRoleResolver';
import { resolvers as DMPResolvers } from './DMPResolver';

export const resolvers: IResolvers = mergeResolvers([
  ContributorRoleResolvers,
  DMPResolvers
]);
