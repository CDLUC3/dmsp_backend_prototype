import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { mysqlConfig } from './config';
import { MysqlDataSource } from './datasources/mysqlDB';
import { DMPHubAPI } from './datasources/dmphub-api';

import { typeDefs } from './schema';
import { resolvers } from './resolver';
import { mocks } from './mocks';

async function startApolloServer() {
  const server = new ApolloServer({
    schema: addMocksToSchema({
      schema: makeExecutableSchema({ typeDefs, resolvers }),
      mocks,
      preserveResolvers: true,
    }),
  });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({
      dataSources: {
        // token: req.headers?.authentication
        // cache: ???
        dmphubAPIDataSource: await new DMPHubAPI({}),
        sqlDataSource: await new MysqlDataSource({ config: mysqlConfig }),
      },
    }),
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
