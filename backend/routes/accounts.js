// backend/routes/accounts.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Get all accounts
router.get('/', async (req, res) => {
  try {
    // Check if status query parameter is provided
    if (req.query.status) {
      const [rows] = await db.query('SELECT * FROM users WHERE status = ?', [req.query.status]);
      res.json(rows);
      return;
    }
    
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get account by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Account not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new account
router.post('/', async (req, res) => {
  const { title, first_name, last_name, email, role, status, password } = req.body;
  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      `INSERT INTO users (title, first_name, last_name, email, role, status, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, first_name, last_name, email, role, status, password_hash]
    );

    // Get the created user (without password)
    const [user] = await db.query(
      'SELECT id, title, first_name, last_name, email, role, status FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(user[0]);
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account by id
router.put('/:id', async (req, res) => {
  const { title, first_name, last_name, role, status, password } = req.body;
  try {
    let query = 'UPDATE users SET title = ?, first_name = ?, last_name = ?, role = ?, status = ?';
    let params = [title, first_name, last_name, role, status];

    // If password is provided, hash it and include in update
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query += ', password_hash = ?';
      params.push(password_hash);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Account not found' });

    // Get the updated user
    const [user] = await db.query(
      'SELECT id, title, first_name, last_name, email, role, status FROM users WHERE id = ?',
      [req.params.id]
    );

    res.json(user[0]);
  } catch (err) {
    console.error('Error updating account:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account by id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Account not found' });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
