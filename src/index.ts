import { ApolloServer } from '@apollo/server';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger } from './logger';
import { serverConfig } from './config';
import { healthcheck } from './controllers/healthcheck';
import { attachApolloServer } from './middleware/express';
import router from './router';
import { MySQLDataSource } from './datasources/mySQLDataSource';
import { Cache } from './datasources/cache';
import { csrfMiddleware } from './middleware/csrf';

// TODO: Make this configurable and pass in as ENV variable
const PORT = 4000;

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
const httpServer = http.createServer(app);

const apolloServer = new ApolloServer({
  cache: Cache.getInstance().adapter,
  ...serverConfig(logger, httpServer)
});

const startServer = async () => {
  await apolloServer.start();
  const { cache } = apolloServer;

  // Healthcheck endpoint (declare this BEFORE CORS definition due to AWS ALB limitations)
  app.get('/up', (_request, response) => healthcheck(apolloServer, response, logger));

  // Express middleware for all requests (besides the healthcheck above)
  app.use(
    cookieParser(),
    cors(),
    csrfMiddleware,
    express.urlencoded({ extended: false }),
    express.json({ limit: '50mb' }),
  )

  // Attach Apollo server to all of the GraphQL calls
  app.use('/graphql', await attachApolloServer(apolloServer, cache, logger))

  // Pass off to the Router for other handling
  app.use('/', router);

  httpServer.listen({ port: 4000 }, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
  })
}

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  const pool = MySQLDataSource.getInstance();
  await pool.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer().catch((error) => {
  console.log('Error starting server:', error)
})
