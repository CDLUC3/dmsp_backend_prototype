import { ApolloServer } from '@apollo/server';
import express from 'express';

import http from 'http';

import { logger } from './logger';
import { serverConfig } from './config';
import { healthcheck } from './controllers/healthcheck';
import { initOAuthServer } from './middleware/auth';
import { handleCors } from './middleware/cors';
import { attachApolloServer } from './middleware/express';

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
const httpServer = http.createServer(app);

// Added this generic wrapper function to accomodate the fact that Typescript doesn't
// allow a top level await
async function startup(config): Promise<void> {
  // Ensure we wait for our server to start
  const apolloServer = new ApolloServer(config);
  await apolloServer.start();

  const { cache } = apolloServer;

  // Healthcheck endpoint (declare this BEFORE Oauth2 and CORS definition due to AWS ALB limitations)
  app.get('/up', (_request, response) => healthcheck(apolloServer, response, logger));

  // Initialize the OAuth2 server
  initOAuthServer(app);

  // Express middleware
  app.use(
    '/',
    express.urlencoded({ extended: false }),
    // 50mb is the limit that Apollo `startStandaloneServer` uses.
    express.json({ limit: '50mb' }),
    // CORS config
    handleCors(),
    // Attach Apollo server
    attachApolloServer(apolloServer, cache, logger),
  );

  // TODO: Add our auth and token endpoints here

  // Modified server startup
  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));

  console.log(`🚀  Server ready at: http://localhost:4000/`);
}

startup(serverConfig(logger, httpServer));
