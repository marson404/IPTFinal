const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all employees with department and user information
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all employees...');
    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.user_id,
        e.department_id,
        e.position,
        e.hire_date,
        e.status,
        e.created_at,
        e.updated_at,
        d.name as department,
        u.first_name,
        u.last_name,
        u.email
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.id DESC
    `);
    console.log('Employees fetched:', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error getting employees:', err);
    res.status(500).json({ error: 'Failed to get employees. ' + err.message });
  }
});

// Get employee by id
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching employee by id:', req.params.id);
    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.user_id,
        e.department_id,
        e.position,
        e.hire_date,
        e.status,
        e.created_at,
        e.updated_at,
        d.name as department,
        u.first_name,
        u.last_name,
        u.email
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      console.log('Employee not found');
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    console.log('Employee found:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting employee:', err);
    res.status(500).json({ error: 'Failed to get employee. ' + err.message });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  const { user_id, department_id, position, hire_date, status } = req.body;
  
  try {
    // Validate required fields
    if (!user_id || !department_id || !position || !hire_date || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields. Need user_id, department_id, position, hire_date, and status.' 
      });
    }

    // Validate status
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either Active or Inactive' });
    }

    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if department exists
    const [departments] = await db.query('SELECT id FROM departments WHERE id = ?', [department_id]);
    if (departments.length === 0) {
      return res.status(400).json({ error: 'Department not found' });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Insert new employee
      console.log('Creating employee with data:', { user_id, department_id, position, hire_date, status });
      const [result] = await db.query(
        'INSERT INTO employees (user_id, department_id, position, hire_date, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, department_id, position, hire_date, status]
      );
      console.log('Employee created with ID:', result.insertId);

      // Create onboarding request
      const requestData = {
        type: 'Onboarding',
        employee_id: result.insertId,
        items: 'Newly hire',
        status: 'Pending'
      };
      console.log('Creating request with data:', requestData);
      
      // First, let's check what types are allowed
      const [typeCheck] = await db.query('SHOW CREATE TABLE requests');
      console.log('Current table structure:', typeCheck);

      const [requestResult] = await db.query(
        'INSERT INTO requests SET ?',
        requestData
      );
      console.log('Request created with ID:', requestResult.insertId);

      // Create workflow for the onboarding request
      const workflowData = {
        request_id: requestResult.insertId,
        employee_id: result.insertId,
        current_step: 'Initial Onboarding',
        status: 'Pending'
      };
      console.log('Creating workflow with data:', workflowData);
      
      await db.query(
        'INSERT INTO workflows SET ?',
        workflowData
      );

      // Commit transaction
      await db.query('COMMIT');

      // Get the created employee with full details
      const [employee] = await db.query(`
        SELECT 
          e.id,
          e.user_id,
          e.department_id,
          e.position,
          e.hire_date,
          e.status,
          e.created_at,
          e.updated_at,
          d.name as department,
          u.first_name,
          u.last_name,
          u.email
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.id = ?
      `, [result.insertId]);

      console.log('Created employee:', employee[0]);
      res.status(201).json({
        employee: employee[0],
        request_id: requestResult.insertId,
        message: 'Employee created with onboarding request and workflow'
      });
    } catch (err) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      console.error('Detailed error:', err);
      console.error('SQL State:', err.sqlState);
      console.error('SQL Message:', err.sqlMessage);
      res.status(500).json({ error: 'Failed to create employee. ' + err.message });
    }
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: 'Failed to create employee. ' + err.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  const { department_id, position, status } = req.body;
  
  try {
    // Check if employee exists
    const [existing] = await db.query('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Validate status if provided
    if (status && !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either Active or Inactive' });
    }

    // Check if department exists if department_id is provided
    if (department_id) {
      const [departments] = await db.query('SELECT id FROM departments WHERE id = ?', [department_id]);
      if (departments.length === 0) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    if (department_id) {
      updates.push('department_id = ?');
      values.push(department_id);
    }
    if (position) {
      updates.push('position = ?');
      values.push(position);
    }
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.params.id);
    await db.query(
      `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated employee
    const [employee] = await db.query(`
      SELECT 
        e.id,
        e.user_id,
        e.department_id,
        e.position,
        e.hire_date,
        e.status,
        e.created_at,
        e.updated_at,
        d.name as department,
        u.first_name,
        u.last_name,
        u.email
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `, [req.params.id]);

    console.log('Updated employee:', employee[0]);
    res.json(employee[0]);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee. ' + err.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    // Check if employee exists
    const [existing] = await db.query('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee
    await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    
    console.log('Deleted employee:', req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee. ' + err.message });
  }
});

module.exports = router; 