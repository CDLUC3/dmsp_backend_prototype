import { DMPHubAPI } from './datasources/dmphub-api';
import { MysqlDataSource } from './datasources/mysqlDB';
import { PostgresDataSource } from './datasources/postgresDB';

export type DataSourceContext = {
  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    postgresDataSource: PostgresDataSource;
    mysqlDataSource: MysqlDataSource
  };
}
