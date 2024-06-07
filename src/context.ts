import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphub-api';
import { MysqlDataSource } from './datasources/mysqlDB';

export type MyContext = {
  token?: string | undefined;
  logger: Logger;

  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    sqlDataSource: MysqlDataSource;
  };
}
