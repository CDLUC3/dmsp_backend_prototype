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

  public pool: mysql.Pool;

  private connection: mysql.PoolConnection;

  private initializePool(): void {
    if (!this.pool) {
      this.pool = mysql.createPool({
        ...mysqlConfig,
        waitForConnections: true,
        queueLimit: 0,
        multipleStatements: false,
      });
    }
  }

  // Create a new connection pool
  private constructor() {
    const connectionLimit = Number.parseInt(process.env.MYSQL_CONNECTION_LIMIT) || 10;
    const queueLimit = Number.parseInt(process.env.MYSQL_QUEUE_LIMIT) || 100;
    const connectTimeout = Number.parseInt(process.env.MYSQL_CONNECT_TIMEOUT) || 60000;

    try {
      this.pool = mysql.createPool({
        ...mysqlConfig,
        connectionLimit, // Maximum 10 concurrent connections
        waitForConnections: true,  // Queue if no connections are available
        queueLimit, // Maximum 100 queued requests
        connectTimeout, // Wait for 60 seconds before timing out
        multipleStatements: false, // Disallow multiple statements for security
      });

      // Register SIGTERM handler for graceful shutdown of the MYSQL connection pool
      process.on('SIGTERM', () => {
        this.releaseConnection();

        this.close()
          .then(() => {
            formatLogMessage(logger).debug('MySQL connection pool closed');
            process.exit(0);
          })
          .catch((err) => {
            formatLogMessage(logger).error({ err, message: 'Error while closing MySQL connection pool' });
            process.exit(1);
          });
      });
    } catch (err) {
      formatLogMessage(logger).error('Unable to establish the MySQL connection pool.');
      throw(err);
    }
  }

  // Retrieve the instance of this class
  public static getInstance(): MySQLDataSource {
    if (!MySQLDataSource.instance) {
      MySQLDataSource.instance = new MySQLDataSource();
    }
    return MySQLDataSource.instance;
  }

  public static async removeInstance(): Promise<void> {
    if (MySQLDataSource.instance) {
      MySQLDataSource.instance.close();
      MySQLDataSource.instance = null;
    }
  }

  // Retrieve a MySQL connection
  public async getConnection(): Promise<mysql.PoolConnection> {
    this.initializePool();

    if (!this.connection) {
      this.connection = await this.pool.getConnection();
    }
    return this.connection;
  }

  // Release the MySQL connection
  public async releaseConnection(): Promise<void> {
    if (this.connection) {
      this.connection.release();
      this.connection = null;
    }
  }

  // Execute a SQL query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async query(sql: string, values?: string[]): Promise<any> {
    try {
      const vals = values.map((val) => (typeof val === 'string') ? val.trim() : val);
      const [rows] = await this.pool.execute(sql, vals);
      return rows;
    } catch (err) {
      formatLogMessage(logger, {
        err,
        sql,
        values,
        message: 'Unable to process SQL query!'
      }).error('Unable to process SQL query!');
      throw new Error('Database query failed');
    }
  }

  // Release the MySQL connection pool
  public async close(): Promise<void> {
    await this.pool.end();
  }
}