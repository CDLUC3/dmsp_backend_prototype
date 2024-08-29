import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphubAPI';
import { DMPToolAPI } from './datasources/dmptoolAPI';
import { MySQLDataSource } from './datasources/mySQLDataSource';
import { JWTToken } from './services/tokenService';
import { formatLogMessage } from './logger';
export interface MyContext {
  token: JWTToken;
  logger: Logger;

  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    dmptoolAPIDataSource: DMPToolAPI;
    sqlDataSource: MySQLDataSource;
  };
}

// This function should only be used when the caller is running a query from outside the
// Apollo Server GraphQL context. e.g. when calling signup or register
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildContext(logger: Logger, cache: any = null, token: JWTToken = null): MyContext {
  if (!cache) {
    // If calling from outside the Apollo server context setup an HttpCache.
    cache = { skipCache: true };
  }

  try {
    return {
      token,
      logger,
      dataSources: {
        dmphubAPIDataSource: new DMPHubAPI({ cache, token }),
        dmptoolAPIDataSource: new DMPToolAPI({ cache, token }),
        sqlDataSource: MySQLDataSource.getInstance(),
      }
    }
  } catch(err) {
    const msg = `Unable to buildContext - ${err.message}`;
    if (logger) {
      formatLogMessage(logger).error(err, msg, { logger, cache, token });
    } else {
      console.log(msg);
    }
    return null;
  }
}
