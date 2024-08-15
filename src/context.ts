import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphubAPI';
import { DMPToolAPI } from './datasources/dmptoolAPI';
import { MySQLDataSource } from './datasources/mySQLDataSource';
import { User } from './models/User';
import { JWTToken } from './services/tokenService';

export interface MyContext {
  token: JWTToken;
  user: User;
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
export async function buildContext(logger: Logger, cache: any = null, token: JWTToken = null): Promise<MyContext> {
  // TODO: figure out how to pass the cache around if we need to
  return {
    token,
    logger,
    user: null,
    dataSources: {
      dmphubAPIDataSource: await new DMPHubAPI({ cache, token }),
      dmptoolAPIDataSource: await new DMPToolAPI({ cache, token }),
      sqlDataSource: await MySQLDataSource.getInstance(),
    }
  }
}
