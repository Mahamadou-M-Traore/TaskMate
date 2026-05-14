const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const swaggerUi  = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const taskRoutes  = require('./routes/tasks');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Documentation ────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅  TaskMate running at http://localhost:${PORT}`);
    console.log(`📄  API Docs at  http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
