import { Logger } from 'pino';
import { MockStore } from '@graphql-tools/mock';
import { DMPHubAPI } from './datasources/dmphub-api';
import { MysqlDataSource } from './datasources/mysqlDB';


export type MyContext = {
  logger: Logger;
  store: MockStore;

  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    sqlDataSource: MysqlDataSource;
  };
}
