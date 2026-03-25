const mysql = require('mysql2');
// mysql2 library to connect Node.js with MySQL
const dotenv = require('dotenv');
dotenv.config();

//here pool is a connection pool that manages multiple connections to the MySQL database. 
// It allows for efficient reuse of connections and handles connection limits and queuing automatically.
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'shopdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();
//nstead of using callbacks, we use the promise-based API of mysql2,
//  which allows us to use async/await syntax for cleaner and more readable code when interacting with the database.

promisePool.getConnection()
  .then(conn => { console.log(' MySQL connected'); conn.release(); })
  .catch(err => console.error(' MySQL connection error:', err.message));

module.exports = promisePool;

//because we are using the promise-based API of mysql2, we export the promisePool object,
//  which allows us to use async/await syntax in our route handlers for cleaner and more readable code when
//  interacting with the database.
// const db = require('./db');

// await db.execute("SELECT * FROM products");