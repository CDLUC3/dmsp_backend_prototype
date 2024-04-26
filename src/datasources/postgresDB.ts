import { PG } from 'pg';

export type pgConfig = {
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class PostgresDataSource {
  private pool: PG.Pool;

  constructor(options: { config: pgConfig }) {
    this.pool = this.initializeDBPool(options?.config);
  }

  async initializeDBPool(config: pgConfig) {
    return new PG.Pool(config);
  }

  async query(sql: string, values: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const result = this.pool.query(sql, values);
        if (result) {
          resolve(result);
        } else {
          reject('Unable to query the Postgres DB.');
        }
      } catch (error) {
        // If an error occurs during query execution, reject the promise with the error
        console.log(error)
        reject(error);
      }
    });
  }
}
