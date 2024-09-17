import { expressMiddleware } from '@apollo/server/express4';
import { JWTAccessToken, verifyAccessToken } from '../services/tokenService';
import { buildContext } from '../context';

export async function attachApolloServer(apolloServer, cache, logger) {
  // expressMiddleware accepts the same arguments:
  //   an Apollo Server instance and optional configuration options
  return expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      // Extract the token from the incoming request so we can pass it on to the resolvers
      const authHeader: string = req?.cookies?.dmspt || '';
      const token: JWTAccessToken = authHeader ? verifyAccessToken(authHeader) : null;
      return buildContext(logger, cache, token);
    },
  });
}
