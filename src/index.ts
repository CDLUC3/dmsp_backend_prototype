import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { mysqlConfig } from './config';
import { MysqlDataSource } from './datasources/mysqlDB';
import { DMPHubAPI } from './datasources/dmphub-api';

import { typeDefs } from './schema';
import { resolvers } from './resolver';

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({
      dataSources: {
        // token: req.headers?.authentication
        // cache: ???
        dmphubAPIDataSource: await new DMPHubAPI({}),
        mysqlDataSource: await new MysqlDataSource({ config: mysqlConfig }),
      }
    }),
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
