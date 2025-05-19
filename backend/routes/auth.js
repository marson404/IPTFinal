const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register route
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { title, first_name, last_name, email, password, role = 'User', status = 'Active' } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !email || !password) {
            console.log('Missing required fields:', { first_name, last_name, email, password: !!password });
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if email already exists
        console.log('Checking for existing email:', email);
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        console.log('Existing user check result:', existing);
        
        if (existing && existing.length > 0) {
            console.log('Email already exists:', email);
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Prepare insert query
        const insertQuery = `
            INSERT INTO users (title, first_name, last_name, email, password_hash, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const insertValues = [title, first_name, last_name, email, hashedPassword, role, status];
        
        console.log('Executing insert query:', insertQuery);
        console.log('Insert values:', insertValues.map((v, i) => i === 4 ? '[HASHED_PASSWORD]' : v));

        // Insert new user
        const [result] = await db.query(insertQuery, insertValues);
        console.log('Insert result:', result);

        if (!result || !result.insertId) {
            throw new Error('Failed to insert user - no insertId returned');
        }

        // Get the created user
        console.log('Fetching created user with ID:', result.insertId);
        const [users] = await db.query(
            'SELECT id, title, first_name, last_name, email, role, status FROM users WHERE id = ?',
            [result.insertId]
        );
        console.log('Fetched user:', users[0]);

        if (!users || users.length === 0) {
            throw new Error('Failed to retrieve created user - no user found after insert');
        }

        console.log('Registration successful');
        res.status(201).json({
            message: 'Account created successfully',
            user: users[0]
        });
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Failed to create account',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        
        // Get user from database
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('Found users:', users.length);
        const user = users[0];

        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('Comparing passwords for user:', user.email);
        // Compare password with password_hash
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log('Password valid:', validPassword);
        
        if (!validPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key', // Use environment variable in production
            { expiresIn: '1h' }
        );

        console.log('Login successful for user:', email);
        res.json({
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        const defaultPassword = 'default123';
        
        // Hash the default password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Update user's password in database
        const [result] = await db.query(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hashedPassword, email]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'Password has been reset to default' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

module.exports = router; 