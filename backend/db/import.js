const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function importDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true // Important for running multiple SQL statements
    });

    try {
        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS ipt_final_db');
        await connection.query('USE ipt_final_db');

        // Read the SQL file from the root directory
        const sqlPath = path.join(__dirname, '../../ipt_final_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the SQL commands
        await connection.query(sql);
        console.log('Database imported successfully!');

    } catch (error) {
        console.error('Error importing database:', error);
    } finally {
        await connection.end();
    }
}

importDatabase(); 