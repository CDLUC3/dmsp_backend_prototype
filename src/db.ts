const mysql = require('mysql2/promise');
const dbConfiguration = require('./dbConfig').default;

async function createConnection() {
    const { host, port, database, user, password } = dbConfiguration;
    try {
        const connection = await mysql.createConnection({
            host: dbConfiguration.host,
            port: dbConfiguration.port,
            database: dbConfiguration.database,
            user: dbConfiguration.user,
            password: dbConfiguration.password
        });

        await connection.connect(); //Connect to database

        console.log('Connected to the database as ID', connection.threadId);
        return connection;
    } catch (err) {
        console.error('Error connecting to the database: ', err.stack);
        throw err;
    }
}


module.exports = createConnection;