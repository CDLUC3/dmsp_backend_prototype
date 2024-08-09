import * as mysql from 'mysql2/promise';
import { mysqlConfig } from "../config/mysqlConfig";
import { logger, formatLogMessage } from '../logger';

export interface PoolConfig {
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
      this.pool = mysql.createPool({
        ...mysqlConfig,
        waitForConnections: true,
        queueLimit: 0,
        multipleStatements: false,
      });
    } catch (err) {
      formatLogMessage(logger, { err, message: 'Unable to establish the MySQL connection pool.' })
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
      const vals = values.map((val) => (typeof val === 'string') ? val.trim() : val);
      const [rows] = await this.pool.execute(sql, vals);
      return rows;
    } catch (err) {
      formatLogMessage(logger, { err, message: 'Uable to process SQL query!' })
      throw err;
    }
  }

  // Release the MySQL connection pool
  public async close(): Promise<void> {
    await this.pool.end();
  }
}