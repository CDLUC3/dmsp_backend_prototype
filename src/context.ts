import { DMPHubAPI } from './datasources/dmphub-api';
import { PostgresDataSource } from './datasources/postgresDB';

export type DataSourceContext = {
  dataSources: {
    dmphubAPIDataSource: DMPHubAPI;
    postgresDataSource: PostgresDataSource;
  };
}
