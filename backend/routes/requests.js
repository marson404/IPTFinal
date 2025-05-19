const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all requests
router.get('/', async (req, res) => {
  try {
    // Simple query without joins for now
    const [requests] = await db.query('SELECT * FROM requests');
    console.log('Fetched requests:', requests); // Debug log
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests: ' + error.message });
  }
});

// Get requests by employee ID
router.get('/employee/:id', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    console.log('Fetching requests for employee:', employeeId);

    // First check if employee exists
    const [employees] = await db.query('SELECT id FROM employees WHERE id = ?', [employeeId]);
    
    if (employees.length === 0) {
      console.log('Employee not found:', employeeId);
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get requests for the employee
    const [requests] = await db.query('SELECT * FROM requests WHERE employee_id = ?', [employeeId]);
    console.log('Found requests:', requests);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests for employee:', error);
    res.status(500).json({ message: 'Error fetching requests: ' + error.message });
  }
});

// Get request by ID
router.get('/:id', async (req, res) => {
  try {
    // Simple query without joins for now
    const [requests] = await db.query('SELECT * FROM requests WHERE id = ?', [req.params.id]);
    console.log('Fetched request:', requests[0]); // Debug log
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(requests[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Error fetching request: ' + error.message });
  }
});

// Create new request
router.post('/', async (req, res) => {
  try {
    const { type, employeeId, employeeEmail, items, status = 'Pending' } = req.body;

    // Validate request type
    const validTypes = ['Leave', 'Equipment', 'Resources', 'Onboarding', 'Department Transfer'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid request type' });
    }

    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Insert the request
    const [result] = await db.query(
      'INSERT INTO requests (type, employee_id, employee_email, items, status) VALUES (?, ?, ?, ?, ?)',
      [type, employeeId, employeeEmail, items, status]
    );

    // Create corresponding workflow entry ONLY for onboarding
    if (result.insertId && type === 'Onboarding') {
      await db.query(
        'INSERT INTO workflows (request_id, employee_id, current_step, status) VALUES (?, ?, ?, ?)',
        [result.insertId, employeeId, 'Initial Onboarding', 'Pending']
      );
    }

    // Get the created request with all fields
    const [createdRequest] = await db.query(
      'SELECT * FROM requests WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(createdRequest[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Update request
router.put('/:id', async (req, res) => {
  try {
    const { type, employee_id, employeeEmail, items, status } = req.body;
    
    // Validate request type if provided
    if (type) {
      const validTypes = ['Leave', 'Equipment', 'Resources', 'Onboarding', 'Department Transfer'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid request type' });
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['Pending', 'Approved', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
    }

    const [result] = await db.query(
      'UPDATE requests SET type = ?, employee_id = ?, employee_email = ?, items = ?, status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [type, employee_id, employeeEmail, items, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    // First delete associated workflows
    await db.query('DELETE FROM workflows WHERE request_id = ?', [req.params.id]);
    
    // Then delete the request
    const [result] = await db.query('DELETE FROM requests WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Error deleting request' });
  }
});

module.exports = router; 