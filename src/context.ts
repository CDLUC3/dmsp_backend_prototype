import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphub-api';
import { MySQLDataSource } from './datasources/mySQLDataSource';
import { User } from './models/User';

export type MyContext = {
  token?: string | undefined;
  user: User | undefined;
  logger: Logger;

  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    sqlDataSource: MySQLDataSource;
  };
}
