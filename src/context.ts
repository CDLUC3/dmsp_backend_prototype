import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphubAPI';
import { DMPToolAPI } from './datasources/dmptoolAPI';
import { MySQLDataSource } from './datasources/mySQLDataSource';
import { JWTAccessToken } from './services/tokenService';
import { randomHex } from './utils/helpers';
import { Cache, CacheEvictor } from './datasources/cache';

// The Apollo Server Context object passed in to the Resolver on each request
export interface MyContext {
  // The cache
  cache: Cache;
  // The cache evictor used to delete keys from the cache
  cacheEvictor: CacheEvictor;
  // The caller's JSON Web Token
  token: JWTAccessToken;
  // An instance of he Logger
  logger: Logger;
  // A unique id that can be used to track all of the log output for a single request
  requestId: string;
  // Instances of the data sources the system uses to access information
  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    dmptoolAPIDataSource: DMPToolAPI;
    sqlDataSource: MySQLDataSource;
  };
}

// This function should only be used when the caller is running a query from outside the
// Apollo Server GraphQL context. e.g. when calling signup or register
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildContext(
  logger: Logger,
  cache: any = null,
  token: JWTAccessToken = null
): Promise<MyContext> {
  if (!cache) {
    // If calling from outside the Apollo server context setup an HttpCache.
    cache = { skipCache: true };
  }

  try {
    return {
      cache,
      cacheEvictor: cache !== null ? await new CacheEvictor().init() : null,
      token,
      logger,
      requestId: randomHex(32),
      dataSources: {
        dmphubAPIDataSource: new DMPHubAPI({ cache, token }),
        dmptoolAPIDataSource: new DMPToolAPI({ cache, token }),
        sqlDataSource: MySQLDataSource.getInstance(),
      }
    }
  } catch(err) {
    const msg = `Unable to buildContext - ${err.message}`;
    if (logger) {
      logger.error({ err, logger, cache, token }, msg);
    } else {
      console.log(msg);
    }
    return null;
  }
}
