import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
// import session from 'express-session';
// import uuid from 'uuid/v4';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs.js';
import resolvers from './resolvers/index.js';
import { User } from './data-models/User.js';

const SESSION_SECRECT = 'example secret';

// Incoming User context
interface MyContext {
  token?: String;
  user?: User;
}

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Ensure we wait for our server to start
await server.start();

// Healthcheck endpoint (skips CORS check because AWS ELB doesn't allow passing headers!)
//   See: https://community.apollographql.com/t/recommended-health-check-strategy-is-impossible-using-aws-load-balancer/6323/3
app.get('/up', (_req, res) => {
  server
    .executeOperation({ query: '{ __typename }' })
    .then((data) => {
      if (data.body.kind === 'single') {
        if (data.body.singleResult.errors) {
          res.status(400).send(JSON.stringify(data.body.singleResult.errors));
        } else {
          res.status(200).send(JSON.stringify(data.body.singleResult.data));
        }
      }
    })
    .catch((error) => {
      res.status(400).send(JSON.stringify(error));
    });
});

// Set up Express to use sessions
// app.use(session({
//   genid: (req: String) => uuid(),
//   secret: SESSION_SECRECT,
//   resave: false,
//   saveUninitialized: false,
//   // TODO: Need a way to enable this on the servers but not in dev
//   // cookie: { secure: true },
//   // TODO: Update to use Redis or some other store (default is local memory)
// }));

// Set up our Express middleware to handle CORS, body parsing, and our expressMiddleware function.
app.use(
  '/',
  cors<cors.CorsRequest>(),
  // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
  express.json({ limit: '50mb' }),
  // expressMiddleware accepts the same arguments:
  //   an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers?.authentication }), // .token }),

    // Note: This example uses the `req` argument to access headers,
    // but the arguments received by `context` vary by integration.
    // This means they vary for Express, Fastify, Lambda, etc.

    // For `startStandaloneServer`, the `req` and `res` objects are
    // `http.IncomingMessage` and `http.ServerResponse` types.
    // context: async ({ req }) => ({
      // Get the user token from the headers.
    //   token: req?.headers?.authorization || '',
      // Lookup the user by the token (if available)
    //   user: await getUser(req?.headers?.authorization) || '',
    // }),
  }),
);

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀  Server ready at: http://localhost:4000/`);
