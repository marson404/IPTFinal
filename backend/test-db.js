const db = require('./db');

async function testDatabase() {
  try {
    // Test connection
    console.log('Testing database connection...');
    const [result] = await db.query('SELECT 1');
    console.log('Database connection successful!');

    // Check if departments table exists
    console.log('\nChecking departments table...');
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'ipt_final_db' 
      AND TABLE_NAME = 'departments'
    `);
    
    if (tables.length === 0) {
      console.log('Departments table does not exist! Creating it...');
      await db.query(`
        CREATE TABLE departments (
          id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
          name varchar(100) NOT NULL,
          description text DEFAULT NULL,
          created_at timestamp NOT NULL DEFAULT current_timestamp(),
          updated_at timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (id),
          UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      console.log('Departments table created successfully!');
    } else {
      console.log('Departments table exists!');
      
      // Check table structure
      const [columns] = await db.query(`
        SHOW COLUMNS FROM departments
      `);
      console.log('\nTable structure:');
      console.log(columns);
    }

  } catch (err) {
    console.error('Database test failed:', err);
  } finally {
    process.exit();
  }
}

testDatabase(); 