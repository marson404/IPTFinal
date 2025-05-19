const db = require('./db');
const bcrypt = require('bcrypt');

async function setupDatabase() {
    try {
        // Create users table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if admin user exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
        
        if (existingUsers.length === 0) {
            // Create default admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            await db.query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role)
                VALUES (?, ?, ?, ?, ?)
            `, ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin']);
            
            console.log('Default admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }

        console.log('Database setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase(); 