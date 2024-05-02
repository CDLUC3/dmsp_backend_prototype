import { DMPHubAPI } from './datasources/dmphub-api';
import { MysqlDataSource } from './datasources/mysqlDB';

export type DataSourceContext = {
  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    sqlDataSource: MysqlDataSource
  };
}
