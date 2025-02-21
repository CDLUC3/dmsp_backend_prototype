import * as dotenv from 'dotenv';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { typeDefs } from './schema';
import { resolvers } from './resolver';
import { mocks } from './mocks';
// import responseCachePlugin from './plugins/customResponseCache';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { loggerPlugin } from './plugins/logger';
import { Cache } from './datasources/cache'; // Import the Cache class or object

import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import Redis from "ioredis";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { cacheConfig } from "./config/cacheConfig";


dotenv.config();

//const redis = new Redis({ ...cacheConfig });
const keyV = new Keyv(new KeyvRedis(`redis://${cacheConfig.host}:${cacheConfig.port}`)) as any;
// const keyV = new Keyv(new KeyvRedis(redis), { namespace: cacheConfig.namespace }) as any;

// Base Apollo server configuration
function baseConfig() {
  // TODO: Could never really get the GraphQL MockStore working the way we wanted
  //       so we aren't using this, but leaving here in case we come back to it someday
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
  return  {
    ...baseConfig(),
    plugins: [
      // The LoggerPlugin is used by Apollo server to record events in the request/response
      // lifecycle as well as handling any GraphQL errors
      loggerPlugin(logger),
      // The ResponseCachePlugin is used to cache responses from the GraphQL server
      responseCachePlugin(),
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // If we are in production disable the default Explorer landing page
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageLocalDefault()
    ],
    // cache: Cache.getInstance().adapter,
    cache: new KeyvAdapter(keyV),
    // Mitigation for an issue that causes Apollo server v4 to return a 200 when a query
    // includes invalid variables.
    //    See: https://www.apollographql.com/docs/apollo-server/migration/#known-regressions
    status400ForVariableCoercionErrors: true
  };
}
