const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRouter = require('./routes/chat');

dotenv.config();

const app = express();
const port = process.env.PORT || 3002; // Different port from jamie-backend

// Middleware - allow frontend on localhost (any port) so React dev server can connect
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    callback(null, allowed);
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/chat', chatRouter);

// Root - avoid 404 when someone opens http://localhost:3002 in browser
app.get('/', (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html>
      <head><title>Class Advisor API</title></head>
      <body style="font-family: system-ui; padding: 2rem; max-width: 40rem;">
        <h1>Class Advisor API</h1>
        <p>This is the backend API. The Skill Tree app runs on a different port.</p>
        <p><strong>Open the Skill Tree app:</strong> <a href="http://localhost:3003">http://localhost:3003</a></p>
        <p><strong>Endpoints:</strong> <code>GET /health</code>, <code>POST /chat</code></p>
      </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'illinois-tech-decision-coach' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Illinois Tech Class Advisor backend running on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
});
