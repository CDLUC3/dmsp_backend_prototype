import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';

import { resolvers as contributorRoleResolvers } from './resolvers/contributorRole';
import { resolvers as dmspResolvers } from './resolvers/dmsp';

export const resolvers: IResolvers = mergeResolvers([dmspResolvers, contributorRoleResolvers]);