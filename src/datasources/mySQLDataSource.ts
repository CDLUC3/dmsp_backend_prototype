import * as mysql from 'mysql2/promise';
import { mysqlConfig } from "../config/mysqlConfig";
import { logger } from '../logger';

export type PoolConfig = {
  connectionLimit: number;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

// Singleton MySQL Connection Pool
export class MySQLDataSource {
  private static instance: MySQLDataSource;
  private pool: mysql.Pool;

  // Create a new connection pool
  private constructor() {
    try {
      this.pool = mysql.createPool({ ...mysqlConfig, waitForConnections: true, queueLimit: 0 });
    } catch (err) {
      logger.error('Unable to establish the MySQL connection pool.');
    }
  }

  // Retrieve the instance of this class
  public static getInstance(): MySQLDataSource {
    if (!MySQLDataSource.instance) {
      MySQLDataSource.instance = new MySQLDataSource();
    }
    return MySQLDataSource.instance;
  }

  // Retrieve the MySQL connection
  public async getConnection(): Promise<mysql.PoolConnection> {
    return this.pool.getConnection();
  }

  // Execute a SQL query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async query(sql: string, values?: string[]): Promise<any> {
    try {
      const vals = values.map((val) => this.sanitizeValue(val));
      const [rows] = await this.pool.execute(sql, vals);
      // console.log(rows);
      return rows;
    } catch (err) {
      logger.error('Error when querying the MySQL database.');
      logger.error(err);
      throw err;
    }
  }

  // Release the MySQL connection pool
  public async close(): Promise<void> {
    await this.pool.end();
  }

  // Helper function to sanitize a string before sending it to the database
  private sanitizeValue(value: string): string {
    return encodeURIComponent(value);
  }
}