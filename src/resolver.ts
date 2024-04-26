import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as contributorRoleResolvers } from './resolvers/contributorRole';
import { resolvers as dmspResolvers } from './resolvers/dmsp';

export const resolvers = mergeResolvers([dmspResolvers, contributorRoleResolvers]);