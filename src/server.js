require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Import routes
const contactRoutes = require('./routes/contact.routes');
const projectRoutes = require('./routes/project.routes');
const githubRoutes = require('./routes/github.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const journeyRoutes = require('./routes/journey.routes');
const skillsRoutes = require('./routes/skills.routes');
const highlightsRoutes = require('./routes/highlights.routes');

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
})); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with larger limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/highlights', highlightsRoutes);

// Admin panel route - serve your frontend admin panel
app.get('/admin', (req, res) => {
  // Try to serve your frontend admin panel
  const adminPath = path.join(__dirname, '../public/index.html');
  
  // Check if the file exists, if not provide a helpful message
  const fs = require('fs');
  if (fs.existsSync(adminPath)) {
    res.sendFile(adminPath);
  } else {
    // If no frontend file exists, provide a helpful response
    res.send(`
      <html>
        <head><title>Admin Panel</title></head>
        <body>
          <h1>Admin Panel Setup Required</h1>
          <p>Please place your admin panel files in the <code>public</code> directory.</p>
          <p>The main file should be named <code>index.html</code></p>
          <p>Or update the server route to point to your frontend files.</p>
          <hr>
          <p>API is available at: <a href="/api/health">/api/health</a></p>
          <p>Admin API endpoints: <code>/api/admin/*</code></p>
        </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
}); 