import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { postgresConfig } from './config';
import { PostgresDataSource } from './datasources/postgresDB';
import { DMPHubAPI } from './datasources/dmphub-api';
import { typeDefs } from './schema';
import { resolvers } from './resolver';

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => ({
      dataSources: {
        token: req.headers?.authentication as string,
        dmphubAPI: await new DMPHubAPI({ token: req.headers.authorization, cache: null }),
        postgresDataSource: new PostgresDataSource({ config: postgresConfig })
      }
    }),
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
