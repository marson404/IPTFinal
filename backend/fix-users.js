const db = require('./db');
const bcrypt = require('bcrypt');

async function fixUsers() {
    try {
        // First, check if we need to add the password_hash column
        const [columns] = await db.query(`
            SHOW COLUMNS FROM users WHERE Field = 'password_hash'
        `);

        if (columns.length === 0) {
            console.log('Adding password_hash column...');
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN password_hash VARCHAR(255) AFTER password
            `);
        }

        // Get all users that might have passwords in the wrong column
        const [users] = await db.query(`
            SELECT id, email, password, password_hash 
            FROM users 
            WHERE password IS NOT NULL
        `);

        console.log(`Found ${users.length} users to process`);

        // Update each user
        for (const user of users) {
            if (user.password && !user.password_hash) {
                // Move password to password_hash
                await db.query(`
                    UPDATE users 
                    SET password_hash = ?, 
                        password = NULL 
                    WHERE id = ?
                `, [user.password, user.id]);
                console.log(`Updated user: ${user.email}`);
            }
        }

        // Create default admin if it doesn't exist
        const [adminUser] = await db.query(`
            SELECT id FROM users WHERE email = 'admin@example.com'
        `);

        if (adminUser.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.query(`
                INSERT INTO users (
                    title, first_name, last_name, email, 
                    password_hash, role, status, created_at, updated_at
                ) VALUES (
                    'Mr', 'Admin', 'User', 'admin@example.com',
                    ?, 'Admin', 'Active', NOW(), NOW()
                )
            `, [hashedPassword]);
            console.log('Created default admin user');
        }

        console.log('User fixes completed successfully');
    } catch (error) {
        console.error('Error fixing users:', error);
    } finally {
        process.exit();
    }
}

fixUsers(); 