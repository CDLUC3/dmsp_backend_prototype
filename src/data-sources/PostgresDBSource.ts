import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';

// Pull in the environment variables from either the .env file or the ENV variables
dotenv.config();

const { Pool } = pg

const pool = new Pool({
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const client = await pool.connect();

const DataSource = {
  generateRecordId(): string {
    const idParts = uuidv4().split('-');
    return `${Date.now()}-${idParts[2]}`;
  },

  generateTimestamp(): string { return new Date().toUTCString() },

  query(sql: string, values: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Ignore any empty values
        const result = client.query(sql, values);
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

export default DataSource;
