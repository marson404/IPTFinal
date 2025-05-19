// backend/index.js
const express = require('express');
const cors = require('cors');
const accountsRouter = require('./routes/accounts');
const authRouter = require('./routes/auth');
const departmentsRouter = require('./routes/departments');
const employeesRouter = require('./routes/employees');
const workflowsRouter = require('./routes/workflows');
const requestsRouter = require('./routes/requests');

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes with /api prefix
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/requests', requestsRouter);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Export for Vercel
module.exports = app;
