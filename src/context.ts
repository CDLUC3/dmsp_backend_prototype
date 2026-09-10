import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphubAPI.js';
import { EZIDAPI } from './datasources/EZIDAPI.js';
import { OpenSearch } from "./datasources/openSearch.js";
import { MySQLConnection, TransactionClient } from './datasources/mysql.js';
import { JWTAccessToken } from './services/tokenService.js';
import { randomHex } from './utils/helpers.js';
import { BaseContext } from "@apollo/server";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { initLogger, prepareObjectForLogs } from "./logger.js";
import { generalConfig } from "./config/generalConfig.js";

// The Apollo Server Context object passed in to the Resolver on each request
export interface MyContext extends BaseContext {
  // The cache
  cache: KeyvAdapter;
  // The caller's JSON Web Token
  token: JWTAccessToken;
  // An instance of the Logger
  logger: Logger;
  // A unique id that can be used to track all the log output for a single request
  requestId: string;
  // The active database transaction, if one is in progress
  activeTransaction?: TransactionClient;
  // Instances of the data sources the system uses to access information
  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    ezidAPIDataSource: EZIDAPI | null;
    sqlDataSource: MySQLConnection;
    openSearchServerlessDataSource: OpenSearch | null;
  };
}

// This function should only be used when the caller is running a query from outside the
// Apollo Server GraphQL context. e.g. when calling signup or register
export function buildContext(
  logger: Logger | null = null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: any | null = null,
  token: JWTAccessToken | null = null,
  sqlDataSource: MySQLConnection | null = null,
  dmphubAPIDataSource: DMPHubAPI | null = null,
  ezidAPIDataSource: EZIDAPI | null = null,
  openSearchServerlessDataSource: OpenSearch | null = null
): MyContext {
  if (!cache) {
    // If calling from outside the Apollo server context setup an HttpCache.
    cache = { skipCache: true };
  }

  try {
    const requestId: string = randomHex(32);
    // `logger` is only null when the caller is running outside the normal Apollo/Express
    // request lifecycle (e.g. a script); initLogger always falls back to a default logger.
    const requestLogger: Logger = initLogger(
      logger as Logger,                       // Base logger
      {
        app: generalConfig.applicationName,   // Help identify entries for this application
        env: generalConfig.env,               // The current environment (not necessarily the Node env)
        requestId,                            // Unique id for the incoming GraphQL request
        jti: token?.jti,                      // The id of the JWT
        userId: token?.id,                    // The current user's id
      }
    );

    return {
      cache,
      // `token` is legitimately null for unauthenticated flows (signin/signup/signout);
      // MyContext.token stays non-nullable to avoid a codebase-wide nullability refactor.
      token: token as JWTAccessToken,
      logger: requestLogger,
      requestId,
      dataSources: {
        dmphubAPIDataSource: dmphubAPIDataSource as DMPHubAPI,
        ezidAPIDataSource: ezidAPIDataSource,
        sqlDataSource: sqlDataSource as MySQLConnection,
        openSearchServerlessDataSource: openSearchServerlessDataSource,
      }
    }
  } catch (err) {
    const msg = `Unable to buildContext - ${err instanceof Error ? err.message : String(err)}`;
    if (logger) {
      logger.error(prepareObjectForLogs({
        err,
        sqlDataSource,
        dmphubAPIDataSource,
        logger,
        cache,
        token
      }),
        msg);
    } else {
      console.log(msg);
    }
    throw new Error(msg);
  }
}
