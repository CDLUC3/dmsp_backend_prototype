import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { knexConfig } from './config';

import { PostgresDB } from './datasources/postgres-db';
// import { DMPHubAPI } from './datasources/dmphub-api';

import { typeDefs } from './schemas';
import { resolvers } from './resolvers';

// Setup the context object which gets passed through to the Resolvers
interface MyContext {
  // user?: UserInfo;
  token?: string;
  dataSources?: {
    // dmphubAPI: DMPHubAPI;
    postgresDB: PostgresDB;
  };
}

async function startApolloServer() {
  const server = new ApolloServer<MyContext>({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => ({
      token: req.headers.authorization,
      dataSources: {
        // dmphubAPI: await new DMPHubAPI({ token, cache }),
        postgesDB: new PostgresDB(knexConfig)
      }
    }),
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
