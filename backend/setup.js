const db = require('./db');

async function setupDatabase() {
    try {
        console.log('Setting up database tables...');

        // Drop existing users table if it exists
        await db.query('DROP TABLE IF EXISTS users');
        console.log('Dropped existing users table');

        // Create users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                title varchar(10) DEFAULT NULL CHECK (title in ('Mr','Mrs')),
                first_name varchar(100) NOT NULL,
                last_name varchar(100) NOT NULL,
                email varchar(255) NOT NULL,
                role varchar(20) DEFAULT 'User' CHECK (role in ('Admin','User')),
                status varchar(20) DEFAULT 'Active' CHECK (status in ('Active','Inactive')),
                password_hash varchar(255) NOT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id),
                UNIQUE KEY email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('Users table created/verified');

        // Create departments table
        await db.query(`
            CREATE TABLE IF NOT EXISTS departments (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                name varchar(100) NOT NULL,
                description text DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id),
                UNIQUE KEY name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('Departments table created/verified');

        // Create employees table
        await db.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                user_id int(11) DEFAULT NULL,
                department_id int(11) DEFAULT NULL,
                position varchar(100) NOT NULL,
                hire_date date NOT NULL,
                status varchar(20) DEFAULT NULL CHECK (status in ('Active','Inactive')),
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('Employees table created/verified');

        // Create requests table
        await db.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                type varchar(50) DEFAULT NULL CHECK (type in ('Leave','Equipment','Resources','Onboarding','Department Transfer')),
                employee_id int(11) DEFAULT NULL,
                employee_email varchar(255) DEFAULT NULL,
                items text NOT NULL,
                status varchar(20) DEFAULT NULL CHECK (status in ('Pending','Approved','Rejected')),
                submission_date timestamp NOT NULL DEFAULT current_timestamp(),
                last_updated timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('Requests table created/verified');

        // Create workflows table
        await db.query(`
            CREATE TABLE IF NOT EXISTS workflows (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                request_id int(11) DEFAULT NULL,
                employee_id int(11) DEFAULT NULL,
                current_step varchar(100) DEFAULT NULL,
                status varchar(50) DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('Workflows table created/verified');

        // Add admin user if not exists
        const [existingAdmin] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
        if (existingAdmin.length === 0) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.query(`
                INSERT INTO users (title, first_name, last_name, email, role, status, password_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, ['Mr', 'Admin', 'User', 'admin@example.com', 'Admin', 'Active', hashedPassword]);
            console.log('Admin user created');
        }

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        process.exit();
    }
}

setupDatabase(); 