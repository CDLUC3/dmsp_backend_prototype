import { URLTypeDefinition, DateTimeISOTypeDefinition } from 'graphql-scalars';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

// Gather up all of the GraphQL TypeDefs
import { typeDefs as contributorRoleType } from './contributorRole/typeDefs.js';
import { typeDefs as dmspType } from './dmsp/typeDefs.js';

// Gather up all of the Resolvers
import contributorRoleResolver from './contributorRole/resolvers.js';
import dmspResolver from './dmsp/resolvers.js';

// Since we define our GraphQL schema in multiple files and a valid schema can have only
// 1 Query and 1 Mutation, we define stub types here and then extend them in the various
// typeDefs.ts files.
const baseTypeDefs = `#graphql
  type Query { _dummy: String }
  type Mutation { _dummy: String }
`;

// Merge them all together for Apollo
const typeArray = [URLTypeDefinition, DateTimeISOTypeDefinition, baseTypeDefs, contributorRoleType, dmspType];
const resolverArray = [contributorRoleResolver, dmspResolver];

export const typeDefs = mergeTypeDefs(typeArray);
export const resolvers = mergeResolvers(resolverArray);
