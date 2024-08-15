import { expressMiddleware } from '@apollo/server/express4';
import { JWTToken, verifyToken } from '../services/tokenService';
import { buildContext } from '../context';

export function attachApolloServer(apolloServer, cache, logger) {
  // expressMiddleware accepts the same arguments:
  //   an Apollo Server instance and optional configuration options
  return expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      // Extract the token from the incoming request so we can pass it on to the resolvers
      const authHeader: string = req?.headers?.authorization || '';
      const authHdr: string = authHeader.split(' ')[1] || null;
      const token: JWTToken = authHeader ? verifyToken(authHdr, logger) : null;

      return buildContext(logger, cache, token);
    },
  });
}
