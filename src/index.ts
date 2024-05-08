import { ApolloServer } from '@apollo/server';
import { startStandaloneServer, } from '@apollo/server/standalone';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { mysqlConfig } from './config';
import { logger } from './logger';
import { MysqlDataSource } from './datasources/mysqlDB';
import { DMPHubAPI } from './datasources/dmphub-api';
import { loggerPlugin } from './plugins/logger';

import { typeDefs } from './schema';
import { resolvers } from './resolver';
import { mocks } from './mocks';

// TODO: We likely want to switch this up to validate the token and return the User in the JWT
function getTokenFromRequest(request) {
  return request.headers?.authentication || '';
}

function serverConfig() {
  // If we are running in offline mode then we will use mocks
  if (process.env?.USE_MOCK_DATA) {
    return {
      schema: addMocksToSchema({
        schema: makeExecutableSchema({ typeDefs, resolvers }),
        mocks,
      }),
    };
  }
  // Otherwise use the normal resolvers connected to our data sources
  return { typeDefs, resolvers };
}

async function startApolloServer() {
  const apolloConfig = { ...serverConfig(), ...{
    // The LoggerPlugin is used by Apollo server to record events in the request/response
    // lifecycle as well as handling any GraphQL errors
    plugins: [loggerPlugin(logger)],
    // Mitigation for an issue that causes Apollo server v4 to return a 200 when a query
    // includes invalid variables.
    //    See: https://www.apollographql.com/docs/apollo-server/migration/#known-regressions
    status400ForVariableCoercionErrors: true
  }};

  const server = new ApolloServer(apolloConfig);
  const { cache } = server;
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      const token = getTokenFromRequest(req);

      return {
        // Pass the logger in so it is available to our resolvers and dataSources
        logger,
        dataSources: {
          dmphubAPIDataSource: await new DMPHubAPI({ cache, token }),
          sqlDataSource: await new MysqlDataSource({ config: mysqlConfig }),
        },
      }
    },
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
