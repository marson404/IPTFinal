// backend/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // default XAMPP user
  password: '',         // default XAMPP password is empty
  database: 'ipt_final_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Successfully connected to the database');
  connection.release();
});

const promisePool = pool.promise();

// Add query logging
const originalQuery = promisePool.query;
promisePool.query = async function (...args) {
  console.log('Executing query:', args[0]);
  try {
    const [rows, fields] = await originalQuery.apply(this, args);
    console.log('Query result:', rows);
    return [rows, fields];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

module.exports = promisePool;
