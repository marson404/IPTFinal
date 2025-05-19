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
const port = 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/auth', authRouter);
app.use('/accounts', accountsRouter);
app.use('/departments', departmentsRouter);
app.use('/employees', employeesRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/requests', requestsRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
