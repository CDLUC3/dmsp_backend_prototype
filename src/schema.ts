import gql from "graphql-tag";
import { mergeTypeDefs } from '@graphql-tools/merge';

import { typeDefs as baseTypeDefs } from './schemas/base';
import { typeDefs as contributorRoleTypeDefs } from './schemas/contributorRole';
import { typeDefs as dmspTypeDefs } from './schemas/dmsp';

export const typeDefs = mergeTypeDefs([baseTypeDefs, dmspTypeDefs, contributorRoleTypeDefs]);
