import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql';

// Create a MySQL connection pool
const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
});

const DataSource = {
  generateRecordId(): string { return uuidv4() },

  generateTimestamp(): string { return new Date().toUTCString() },

  query(sql: string, values: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        connectionPool.query(sql, values, (error: mysql.MysqlError | null, results: any[] | any) => {
          if (error) {
            reject(error);
          } else {
            resolve(results)
          }
        });
      } catch (error) {
        // If an error occurs during query execution, reject the promise with the error
        reject(error);
      }
    });
  }
}

export default DataSource;
