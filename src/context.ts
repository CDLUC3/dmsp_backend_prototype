import { Logger } from 'pino';
import { DMPHubAPI } from './datasources/dmphub-api';
import { MysqlDataSource } from './datasources/mysqlDB';
import { MockMySQLTable } from './mocks/MockMySQLTable';

export type MyContext = {
  logger: Logger;

  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    sqlDataSource: MysqlDataSource;
  };

  mockStores: {
    contributorRoles: MockMySQLTable;
    users: MockMySQLTable;
  };
}
