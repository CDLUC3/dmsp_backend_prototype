const dbConfiguration = {
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT),
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || '3306',
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
};

export default dbConfiguration;