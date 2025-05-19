const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/config');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, first_name, last_name, email, role, status FROM users'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, first_name, last_name, email, role, status FROM users WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to access their own data unless they're an admin
    if (req.user.role !== 'Admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, firstName, lastName, email, role, password, status } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (title, first_name, last_name, email, role, password_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, first_name, last_name, email, role, status`,
      [title, firstName, lastName, email, role, passwordHash, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // unique violation
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, firstName, lastName, email, role, status } = req.body;
    
    // Only allow admins to update role and status
    if (req.user.role !== 'Admin' && (role || status)) {
      return res.status(403).json({ message: 'Only admins can update role and status' });
    }

    // Only allow users to update their own data unless they're an admin
    if (req.user.role !== 'Admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await db.query(
      `UPDATE users 
       SET title = $1, first_name = $2, last_name = $3, email = $4, 
           role = COALESCE($5, role), status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, title, first_name, last_name, email, role, status`,
      [title, firstName, lastName, email, role, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 