import * as mysql2 from 'mysql2/promise';
import { mysqlGeneralConfig, mysqlPoolConfig } from "../config/mysqlConfig";
import { logger, formatLogMessage } from '../logger';
import { MyContext } from '../context';
export interface PoolConfig {
  connectionLimit: number;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

// Register SIGTERM handler for graceful shutdown of the MYSQL connection pool
process.on('SIGTERM', () => {
  const instance = mysql.getInstance();

  if (instance) {
    instance.releaseConnection();

    // Close the MySQL connection pool
    instance.close()
      .then(() => {
        logger.debug('MySQL connection pool closed');
        process.exit(0);
      })
      .catch((err) => {
        logger.error({ err, message: 'Error while closing MySQL connection pool' });
        process.exit(1);
      });
  }
});

// Singleton MySQL Connection Pool
export class mysql {
  private static instance: mysql;

  public pool: mysql2.Pool;

  private connection: mysql2.PoolConnection;

  private initializePool(): void {
    if (!this.pool) {
      this.pool = mysql2.createPool({
        ...mysqlPoolConfig,
        waitForConnections: true,
        queueLimit: 0,
        multipleStatements: false,
      });
    }
  }

  // Create a new connection pool
  private constructor() {
    logger.info('Establishing MySQL connection pool ...');

    try {
      this.pool = mysql2.createPool({
        ...mysqlPoolConfig,
        waitForConnections: true,  // Queue if no connections are available
        queueLimit: mysqlGeneralConfig.queueLimit,
        connectTimeout: mysqlGeneralConfig.connectTimeout,
        multipleStatements: false, // Disallow multiple statements for security
      });

    } catch (err) {
      logger.error('Unable to establish the MySQL connection pool.');
      throw(err);
    }
  }

  // Retrieve the instance of this class
  public static getInstance(): mysql {
    if (!mysql.instance) {
      mysql.instance = new mysql();
    }
    return mysql.instance;
  }

  public static async removeInstance(): Promise<void> {
    if (mysql.instance) {
      mysql.instance.close();
      mysql.instance = null;
    }
  }

  // Retrieve a MySQL connection
  public async getConnection(): Promise<mysql2.PoolConnection> {
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
  public async query(context: MyContext, sql: string, values?: string[]): Promise<any> {
    try {
      const vals = values.map((val) => (typeof val === 'string') ? val.trim() : val);
      const [rows] = await this.pool.execute(sql, vals);
      return rows;
    } catch (err) {
      formatLogMessage(context).error({ err, sql, values }, 'Unable to process SQL query!');
      throw new Error('Database query failed');
    }
  }

  // Release the MySQL connection pool
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}