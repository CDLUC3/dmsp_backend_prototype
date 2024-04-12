import { DMPHubAPI } from './datasources/dmphub-api';
import { PostgresDB } from './datasources/postgres-db';

export type DataSourceContext = {
  dataSources: {
    dmphubAPI: DMPHubAPI;
    postgresDB: PostgresDB;
  };
}
