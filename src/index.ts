import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { postgresConfig, mysqlConfig } from './config';
import { PostgresDataSource } from './datasources/postgresDB';
import { MysqlDataSource } from './datasources/mysqlDB';
import { DMPHubAPI } from './datasources/dmphub-api';

import { typeDefs } from './schema';
import { resolvers } from './resolver';

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({
      dataSources: {
        // token: null, // req.headers?.authentication as string,
        // dmphubAPI: new DMPHubAPI({ token: '', cache: null }), //req.headers.authorization, cache: null }),
        // postgresDataSource: await new PostgresDataSource({ config: postgresConfig })
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
