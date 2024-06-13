import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphub-api';
import { MySQLDataSource } from './datasources/mySQLDataSource';

export type MyContext = {
  token?: string | undefined;
  logger: Logger;

  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    sqlDataSource: MySQLDataSource;
  };
}
