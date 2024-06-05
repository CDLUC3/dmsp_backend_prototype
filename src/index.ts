import { ApolloServer } from '@apollo/server';

import express from 'express';
import http from 'http';
import cors from 'cors';

import { logger } from './logger';
import { serverConfig } from './config';
import { healthcheck } from './pages/healthcheck';
import { attachApolloServer } from './middleware/express';
import router from './router';

const PORT = 4000;

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
const httpServer = http.createServer(app);


const apolloServer = new ApolloServer(serverConfig(logger, httpServer));

const startServer = async () => {
  await apolloServer.start();
  const { cache } = apolloServer;

  // Healthcheck endpoint (declare this BEFORE CORS definition due to AWS ALB limitations)
  app.get('/up', (_request, response) => healthcheck(apolloServer, response, logger));

  // Express middleware

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: '50mb' }));
  app.use(cors())

  app.use('/graphql', attachApolloServer(apolloServer, cache, logger))

  app.use('/', router);
  httpServer.listen({ port: 4000 }, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
  })
}


startServer().catch((error) => {
  console.log('Error starting server:', error)
})


