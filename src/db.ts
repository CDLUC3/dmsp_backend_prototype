import mysql from 'mysql2/promise';
import { mysqlConfig } from './config';

// TODO: UPdate this to use the datasource defined and the connection pool

export async function createConnection() {
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    await connection.connect(); //Connect to database

    console.log('Connected to the database as ID', connection.threadId);
    return connection;
  } catch (err) {
    console.error('Error connecting to the database: ', err.stack);
    throw err;
  }
}
