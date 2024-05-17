import { ApolloServer } from '@apollo/server';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { MyContext } from '../src/context';
import { typeDefs } from '../src/schema';
import { resolvers } from '../src/resolver';
import { mocks } from '../src/mocks';

// Test server using mocks
export const server = new ApolloServer<MyContext>({
  schema: addMocksToSchema({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    mocks,
  }),
});
