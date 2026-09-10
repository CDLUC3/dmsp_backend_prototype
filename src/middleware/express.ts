import { expressMiddleware } from '@as-integrations/express5';
import { JWTAccessToken } from '../services/tokenService.js';
import { buildContext } from '../context.js';
import { ApolloServer } from '@apollo/server';
import { Request } from 'express-jwt';
import { Logger } from "pino";
import { MySQLConnection } from "../datasources/mysql.js";
import { DMPHubAPI } from "../datasources/dmphubAPI.js";
import { EZIDAPI } from "../datasources/EZIDAPI.js";
import { OpenSearch } from "../datasources/openSearch.js";

export async function attachApolloServer(
  apolloServer: ApolloServer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: any,
  logger: Logger,
  sqlDataSource: MySQLConnection,
  dmphubAPIDataSource: DMPHubAPI,
  ezidAPIDataSource: EZIDAPI,
  openSearchServerlessDataSource: OpenSearch
) {
  const context = buildContext(
    logger,
    cache,
    null,
    sqlDataSource,
    dmphubAPIDataSource,
    ezidAPIDataSource,
    openSearchServerlessDataSource,
  );
  context.logger.info({}, 'Attaching Apollo server');

  // Make sure we're able to establish a connection to the MySQL DB before continuing
  await sqlDataSource.validateConnection()

  // expressMiddleware accepts the same arguments:
  //   an Apollo Server instance and optional configuration options
  return expressMiddleware(apolloServer, {
    context: async ({ req }: { req: Request }) => {
      // Extract the token from the incoming request so we can pass it on to the resolvers
      //
      // Note: `req.auth`'s compile-time shape is polluted by an unrelated `declare global`
      // augmentation in src/controllers/__tests__/integrationTokens.spec.ts (which widens
      // Express.Request.auth to a test-only `{ userId, role }` shape). At runtime the
      // authMiddleware (see src/middleware/auth.ts) always populates `auth` with the
      // JWTAccessToken payload produced by generateAccessToken, so the double cast below
      // reflects the real shape rather than papering over a null-check gap.
      return buildContext(
        logger,
        cache,
        req.auth as unknown as JWTAccessToken,
        sqlDataSource,
        dmphubAPIDataSource,
        ezidAPIDataSource,
        openSearchServerlessDataSource
      );
    },
  });
}
