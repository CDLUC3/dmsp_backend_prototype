import * as dotenv from 'dotenv';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';

import { typeDefs } from './schema';
import { resolvers } from './resolver';
import { mocks } from './mocks';
import { loggerPlugin } from './plugins/logger';

dotenv.config();

// Base Apollo server configuration
function baseConfig() {
  // If we are running in offline mode then we will use mocks
  if (['true', '1'].includes(process.env?.USE_MOCK_DATA?.toString()?.toLowerCase())) {
    return {
      schema: addMocksToSchema({
        schema: makeExecutableSchema({ typeDefs, resolvers }),
        mocks,
        preserveResolvers: true
      }),
    };
  }
  // Otherwise use the normal resolvers connected to our data sources
  return { typeDefs, resolvers };
}

// Standard Apollo server configuration regarless of whether we are using mock data or not
export function serverConfig(logger, httpServer) {
  return  { ...baseConfig(), ...{
    plugins: [
      // The LoggerPlugin is used by Apollo server to record events in the request/response
      // lifecycle as well as handling any GraphQL errors
      loggerPlugin(logger),
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // If we are in production disable the default Explorer landing page
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageLocalDefault()
    ],
    // Mitigation for an issue that causes Apollo server v4 to return a 200 when a query
    // includes invalid variables.
    //    See: https://www.apollographql.com/docs/apollo-server/migration/#known-regressions
    status400ForVariableCoercionErrors: true
  }};
}
