import { expressMiddleware } from '@apollo/server/express4';
import { JWTAccessToken } from '../services/tokenService';
import { buildContext } from '../context';
import { ApolloServer } from '@apollo/server';
import { Request } from 'express-jwt';
import { formatLogMessage } from '../logger';

export async function attachApolloServer(apolloServer: ApolloServer, cache, logger) {
  formatLogMessage(logger).info(null, 'Attaching Apollo server');
  // expressMiddleware accepts the same arguments:
  //   an Apollo Server instance and optional configuration options
  return expressMiddleware(apolloServer, {
    context: async ({ req }: { req: Request }) => {
      // Extract the token from the incoming request so we can pass it on to the resolvers
      return buildContext(logger, cache, req.auth as JWTAccessToken);
    },
  });
}
