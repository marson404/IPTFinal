const express = require('express');
const router = express.Router();
const db = require('../db');

// Get workflows by employee ID
router.get('/employee/:id', async (req, res) => {
  const employeeId = parseInt(req.params.id);
  console.log('Getting workflows for employee:', employeeId);
  
  try {
    // First check if the employee exists with more detailed query
    const [employees] = await db.query(`
      SELECT 
        e.id,
        e.user_id,
        e.department_id,
        e.position,
        u.first_name,
        u.last_name,
        u.email
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `, [employeeId]);
    
    console.log('Employee query result:', employees);
    
    if (!employees || employees.length === 0) {
      console.log('Employee not found:', employeeId);
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get workflows for the employee
    const [workflows] = await db.query(`
      SELECT 
        w.*,
        r.type as request_type,
        r.items as request_items
      FROM workflows w
      LEFT JOIN requests r ON w.request_id = r.id
      WHERE w.employee_id = ?
      ORDER BY w.created_at DESC
    `, [employeeId]);
    
    console.log('Found workflows:', workflows);
    res.json(workflows);
  } catch (err) {
    console.error('Error getting workflows:', err);
    res.status(500).json({ error: 'Failed to get workflows. ' + err.message });
  }
});

// Get workflow by ID
router.get('/:id', async (req, res) => {
  console.log('Received request for workflow:', req.params.id);
  try {
    const [rows] = await db.query(`
      SELECT 
        w.*,
        r.type as request_type,
        r.items as request_items
      FROM workflows w
      LEFT JOIN requests r ON w.request_id = r.id
      WHERE w.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      console.log('No workflow found with ID:', req.params.id);
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    console.log('Found workflow:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting workflow:', err);
    res.status(500).json({ error: 'Failed to get workflow. ' + err.message });
  }
});

// Create new workflow
router.post('/', async (req, res) => {
  try {
    const { request_id, employee_id, current_step, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO workflows (request_id, employee_id, current_step, status)
       VALUES (?, ?, ?, ?)`,
      [request_id, employee_id, current_step, status]
    );

    const [workflow] = await db.query(
      `SELECT 
        w.*,
        r.type as request_type,
        r.items as request_items
       FROM workflows w
       LEFT JOIN requests r ON w.request_id = r.id
       WHERE w.id = ?`,
      [result.insertId]
    );

    res.status(201).json(workflow[0]);
  } catch (err) {
    console.error('Error creating workflow:', err);
    res.status(500).json({ error: 'Failed to create workflow. ' + err.message });
  }
});

// Update workflow
router.put('/:id', async (req, res) => {
  try {
    const { current_step, status } = req.body;
    await db.query(
      `UPDATE workflows 
       SET current_step = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [current_step, status, req.params.id]
    );

    const [workflow] = await db.query(
      `SELECT 
        w.*,
        r.type as request_type,
        r.items as request_items
       FROM workflows w
       LEFT JOIN requests r ON w.request_id = r.id
       WHERE w.id = ?`,
      [req.params.id]
    );

    if (workflow.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow[0]);
  } catch (err) {
    console.error('Error updating workflow:', err);
    res.status(500).json({ error: 'Failed to update workflow. ' + err.message });
  }
});

// Update workflow status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Get the workflow to find the request_id
    const [workflow] = await db.query(
      'SELECT request_id FROM workflows WHERE id = ?',
      [req.params.id]
    );

    if (workflow.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Begin transaction
    await db.query('START TRANSACTION');

    try {
      // Update workflow status
    await db.query(
      `UPDATE workflows 
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, req.params.id]
    );

      // Update request status
      await db.query(
        `UPDATE requests 
         SET status = ?, last_updated = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, workflow[0].request_id]
      );

      // Commit transaction
      await db.query('COMMIT');

      // Get updated workflow with request info
      const [updatedWorkflow] = await db.query(
      `SELECT 
        w.*,
        r.type as request_type,
        r.items as request_items
       FROM workflows w
       LEFT JOIN requests r ON w.request_id = r.id
       WHERE w.id = ?`,
      [req.params.id]
    );

      if (updatedWorkflow.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

      res.json(updatedWorkflow[0]);
    } catch (err) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error updating workflow status:', err);
    res.status(500).json({ error: 'Failed to update workflow status. ' + err.message });
  }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM workflows WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting workflow:', err);
    res.status(500).json({ error: 'Failed to delete workflow. ' + err.message });
  }
});

module.exports = router; 