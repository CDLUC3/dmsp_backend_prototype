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
import { mysql } from './datasources/mysql';
import { Cache } from './datasources/cache';
import { verifyCriticalEnvVariable } from './utils/helpers';
import corsConfig from './config/corsConfig';
import { authMiddleware } from './middleware/auth';

verifyCriticalEnvVariable('NODE_ENV');
console.log(`DMPTool Apollo server backend starting in ${process.env.NODE_ENV} mode.`)

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
    cors(corsConfig()),
    express.urlencoded({ extended: false }),
    express.json({ limit: '50mb' }),
  )

  // GraphQL operations
  // Apollo server has it's own built-in way of dealing with CSRF.
  //     See: https://www.apollographql.com/docs/router/configuration/csrf/
  // Use the authMiddleware to extract the token from the cookies and then Attach Apollo server
  app.use('/graphql', authMiddleware, await attachApolloServer(apolloServer, cache, logger))

  // Pass off to the Router for other non-GraphQL handling
  app.use('/', router);

  await httpServer.listen({ port: 4000 }, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
  })
}

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  const pool = mysql.getInstance();
  pool.releaseConnection();
  await pool.close();
  process.exit(0);
};

if (!process.listeners('SIGINT').includes(shutdown)) {
  process.on('SIGINT', shutdown);
}
if (!process.listeners('SIGTERM').includes(shutdown)) {
  process.on('SIGTERM', shutdown);
}

startServer().catch((error) => {
  console.log('Error starting server:', error)
});

export default app;
