const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all departments
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all departments...');
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.name,
        d.description,
        d.created_at,
        d.updated_at,
        COUNT(e.id) as employeeCount
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id
      ORDER BY d.name
    `);
    console.log('Departments fetched:', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error getting departments:', err);
    res.status(500).json({ error: 'Failed to get departments. ' + err.message });
  }
});

// Get department by id
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching department by id:', req.params.id);
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.name,
        d.description,
        d.created_at,
        d.updated_at,
        COUNT(e.id) as employeeCount
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      WHERE d.id = ?
      GROUP BY d.id
    `, [req.params.id]);
    
    if (rows.length === 0) {
      console.log('Department not found');
      return res.status(404).json({ error: 'Department not found' });
    }
    console.log('Department found:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting department by id:', err);
    res.status(500).json({ error: 'Failed to get department. ' + err.message });
  }
});

// Create new department
router.post('/', async (req, res) => {
  console.log('Creating new department with data:', req.body);
  const { name, description } = req.body;
  
  try {
    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Valid name is required' });
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Valid description is required' });
    }

    // Check if department name already exists
    console.log('Checking for existing department with name:', name);
    const [existing] = await db.query('SELECT id FROM departments WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      console.log('Department name already exists');
      return res.status(400).json({ error: 'Department name already exists' });
    }

    // Insert new department
    console.log('Inserting new department');
    const [result] = await db.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name.trim(), description.trim()]
    );

    if (!result.insertId) {
      throw new Error('Failed to get inserted department ID');
    }

    // Get the created department
    console.log('Fetching created department with id:', result.insertId);
    const [departments] = await db.query(`
      SELECT 
        d.id,
        d.name,
        d.description,
        d.created_at,
        d.updated_at,
        0 as employeeCount
      FROM departments d
      WHERE d.id = ?
    `, [result.insertId]);

    if (departments.length === 0) {
      throw new Error('Created department not found');
    }

    console.log('Successfully created department:', departments[0]);
    res.status(201).json(departments[0]);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department. ' + err.message });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  console.log('Updating department with id:', req.params.id, 'Data:', req.body);
  const { name, description } = req.body;
  
  try {
    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Valid name is required' });
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Valid description is required' });
    }

    // Check if department exists
    const [existing] = await db.query('SELECT id FROM departments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      console.log('Department not found');
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if new name conflicts with another department
    const [nameCheck] = await db.query(
      'SELECT id FROM departments WHERE name = ? AND id != ?',
      [name.trim(), req.params.id]
    );
    if (nameCheck.length > 0) {
      console.log('Department name already exists');
      return res.status(400).json({ error: 'Department name already exists' });
    }

    // Update department
    await db.query(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description.trim(), req.params.id]
    );

    // Get updated department
    const [departments] = await db.query(`
      SELECT 
        d.id,
        d.name,
        d.description,
        d.created_at,
        d.updated_at,
        COUNT(e.id) as employeeCount
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      WHERE d.id = ?
      GROUP BY d.id
    `, [req.params.id]);

    console.log('Successfully updated department:', departments[0]);
    res.json(departments[0]);
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ error: 'Failed to update department. ' + err.message });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting department with id:', req.params.id);
    
    // Check if department has associated employees
    const [employees] = await db.query(
      'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
      [req.params.id]
    );

    if (employees[0].count > 0) {
      console.log('Department has associated employees');
      return res.status(400).json({
        error: 'Cannot delete department with associated employees'
      });
    }

    const [result] = await db.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      console.log('Department not found');
      return res.status(404).json({ error: 'Department not found' });
    }

    console.log('Department deleted successfully');
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ error: 'Failed to delete department. ' + err.message });
  }
});

module.exports = router; 