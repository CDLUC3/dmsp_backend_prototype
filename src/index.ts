import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';

import express from 'express';
import http from 'http';
import cors from 'cors';

import { typeDefs } from './schema';
import { resolvers } from './resolver';
import { mocks } from './mocks';
import { loggerPlugin } from './plugins/logger';

import { logger } from './logger';
import { mysqlConfig } from './config';
import { DMPHubAPI } from './datasources/dmphub-api';
import { MysqlDataSource } from './datasources/mysqlDB';

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
const httpServer = http.createServer(app);

// Added this generic wrapper function to accomodate the fact that Typescript doesn't
// allow a top level await
async function startup(config, ): Promise<void> {
  // TODO: We likely want to switch this up to validate the token and return the User in the JWT
  function getTokenFromRequest(request) {
    return request.headers?.authentication || '';
  }

  // Ensure we wait for our server to start
  const server = new ApolloServer(config);
  await server.start();

  const { cache } = server;

  // Healthcheck endpoint
  app.get('/up', (_req, res) => {
    server.executeOperation({ query: '{ __typename }' })
          .then((data) => {
            if (data.body.kind === 'single') {
              if (data.body.singleResult.errors) {
                const msgs = data.body.singleResult.errors.map((err) => err.message);
                logger.error(`ERROR: Healthcheck - ${msgs.join(', ')}`);
                res.status(400).send(JSON.stringify(data.body.singleResult.errors));
              } else {
                res.status(200).send(JSON.stringify(data.body.singleResult.data));
              }
            }
          })
          .catch((error) => {
            logger.error(`ERROR: Healthcheck - ${error.message}`);
            res.status(400).send(JSON.stringify(error));
          });
  });

  // Set up our Express middleware to handle CORS, body parsing, and our expressMiddleware function.
  app.use(
    '/',
    cors<cors.CorsRequest>(),
    // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to
    // suit your needs
    express.json({ limit: '50mb' }),
    // expressMiddleware accepts the same arguments:
    //   an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
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
    }),
  );

  // Modified server startup
  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));

  console.log(`🚀  Server ready at: http://localhost:4000/`);
}

// Base Apollo server configuration
function baseConfig() {
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

// Standard Apollo server configuration regarless of whether we are using mock data or not
const serverConfig = { ...baseConfig(), ...{
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

startup(serverConfig);
