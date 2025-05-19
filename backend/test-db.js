const db = require('./db');
const bcrypt = require('bcrypt');

async function testDatabase() {
  try {
    // Test connection
    console.log('Testing database connection...');
    const [result] = await db.query('SELECT 1');
    console.log('Database connection successful!\n');

    // Create users table if it doesn't exist
    console.log('Checking users table...');
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'u875409848_marson' 
      AND TABLE_NAME = 'users'
    `);
    
    if (tables.length === 0) {
      console.log('Users table does not exist! Creating it...');
      await db.query(`
        CREATE TABLE users (
          id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
          email varchar(255) NOT NULL,
          password varchar(255) NOT NULL,
          role enum('admin', 'user') NOT NULL DEFAULT 'user',
          created_at timestamp NOT NULL DEFAULT current_timestamp(),
          updated_at timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (id),
          UNIQUE KEY email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      console.log('Users table created successfully!');

      // Add admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(`
        INSERT INTO users (email, password, role)
        VALUES (?, ?, 'admin')
      `, ['admin@example.com', hashedPassword]);
      console.log('Admin user created successfully!');
    }

    // Show all tables
    console.log('\nFetching all tables...');
    const [allTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'u875409848_marson'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\nFound tables:', allTables.map(t => t.TABLE_NAME).join(', '), '\n');

    // For each table, show its structure and content
    for (const table of allTables) {
      const tableName = table.TABLE_NAME;
      
      // Show table structure
      console.log(`\n=== Structure of ${tableName} ===`);
      const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
      console.log(columns);
      
      // Show table content (excluding password field for users table)
      console.log(`\n=== Content of ${tableName} ===`);
      if (tableName === 'users') {
        const [rows] = await db.query(`SELECT id, email, role, created_at, updated_at FROM ${tableName}`);
        console.log(rows);
      } else {
        const [rows] = await db.query(`SELECT * FROM ${tableName}`);
        console.log(rows);
      }
      console.log('\n');
    }

  } catch (err) {
    console.error('Database test failed:', err);
  } finally {
    process.exit();
  }
}

testDatabase(); 