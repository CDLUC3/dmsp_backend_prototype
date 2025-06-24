import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphubAPI'
import { MySQLConnection } from './datasources/mysql';
import { JWTAccessToken } from './services/tokenService';
import { randomHex } from './utils/helpers';
import {BaseContext} from "@apollo/server";
import {KeyvAdapter} from "@apollo/utils.keyvadapter";

// The Apollo Server Context object passed in to the Resolver on each request
export interface MyContext extends BaseContext {
  // The cache
  cache: KeyvAdapter;
  // The caller's JSON Web Token
  token: JWTAccessToken;
  // An instance of he Logger
  logger: Logger;
  // A unique id that can be used to track all of the log output for a single request
  requestId: string;
  // Instances of the data sources the system uses to access information
  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    sqlDataSource: MySQLConnection;
  };
}

// This function should only be used when the caller is running a query from outside the
// Apollo Server GraphQL context. e.g. when calling signup or register
export function buildContext(
  logger: Logger,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: any | null = null,
  token: JWTAccessToken | null = null,
  sqlDataSource: MySQLConnection | null = null ,
  dmphubAPIDataSource: DMPHubAPI | null = null,
): MyContext {
  if (!cache) {
    // If calling from outside the Apollo server context setup an HttpCache.
    cache = { skipCache: true };
  }

  try {
    return {
      cache,
      token,
      logger,
      requestId: randomHex(32),
      dataSources: {
        dmphubAPIDataSource: dmphubAPIDataSource,
        sqlDataSource: sqlDataSource,

      }
    }
  } catch(err) {
    const msg = `Unable to buildContext - ${err.message}`;
    if (logger) {
      logger.error(
        {
          err,
          sqlDataSource,
          dmphubAPIDataSource,
          logger,
          cache,
          token
        },
        msg
      );
    } else {
      console.log(msg);
    }
    return null;
  }
}
