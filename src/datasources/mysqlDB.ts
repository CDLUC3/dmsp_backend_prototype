import * as mysql from 'mysql2/promise';

export type PoolConfig = {
  connectionLimit: number;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class MysqlDataSource {
  private pool: mysql.Pool;

  constructor(options: { config: PoolConfig }) {
    try {
      this.pool = mysql.createPool(options?.config)
    } catch(err) {
      console.log('Unable to establish the MySQL connection pool.')
    }
  }

  async query(sql: string, values: string[]): Promise<any> {
    try {
      const [rows] = await this.pool.query(sql, values);
      // console.log(rows);
      return rows;
    } catch(err) {
      console.log('Error when querying the MySQL database.');
      console.log(err);
      return null;
    }
  }
}