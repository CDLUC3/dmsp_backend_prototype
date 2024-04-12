import { mergeTypeDefs } from '@graphql-tools/merge';
import { typeDefs as baseTypeDefs } from './Base';
import { typeDefs as contributorTypeDefs } from './ContributorRole';
import { typeDefs as dmpTypeDefs } from './DMP';

export const typeDefs = mergeTypeDefs([baseTypeDefs, contributorTypeDefs, dmpTypeDefs]);
