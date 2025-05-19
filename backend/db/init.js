const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'ipt_final_db'
    });

    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the SQL commands
        await connection.query(sql);
        console.log('Database tables created successfully!');

        // Insert default admin account if it doesn't exist
        const [existingAdmin] = await connection.query(
            'SELECT * FROM accounts WHERE email = ?',
            ['admin@example.com']
        );

        if (!existingAdmin.length) {
            const bcrypt = require('bcrypt');
            const defaultPassword = 'admin123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            await connection.query(
                `INSERT INTO accounts (title, first_name, last_name, email, role, password_hash, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                ['Mr', 'Admin', 'User', 'admin@example.com', 'Admin', hashedPassword, 'Active']
            );
            console.log('Default admin account created!');
            console.log('Email: admin@example.com');
            console.log('Password: admin123');
        }

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await connection.end();
    }
}

initializeDatabase(); 