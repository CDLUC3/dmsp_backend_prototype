import { mergeTypeDefs } from '@graphql-tools/merge';

import { typeDefs as baseTypeDefs } from './schemas/base';
import { typeDefs as affiliationTypeDefs } from './schemas/affiliation';
import { typeDefs as contributorRoleTypeDefs } from './schemas/contributorRole';
import { typeDefs as dmspTypeDefs } from './schemas/dmsp';
import { typeDefs as userTypeDefs } from './schemas/user';

export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  affiliationTypeDefs,
  contributorRoleTypeDefs,
  dmspTypeDefs,
  userTypeDefs
]);
