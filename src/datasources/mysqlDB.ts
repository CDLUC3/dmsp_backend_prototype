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

  // Helper function to sanitize a string before sending it to the database
  sanitizeValue(value: string): string {
    return encodeURIComponent(value);
  }

  // Send the specified query to the database
  async query(sql: string, values: string[]): Promise<any> {
    try {
      const vals = values.map((val) => this.sanitizeValue(val));
      const [rows] = await this.pool.execute(sql, vals);
      // console.log(rows);
      return rows;
    } catch(err) {
      console.log('Error when querying the MySQL database.');
      console.log(err);
      throw err;
    }
  }
}