const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./Config/database');
const authRoutes = require('./Routes/Auth.Routes');
const notesRoutes = require('./Routes/Notes.Routes');
const folderRoutes = require('./Routes/Folders.Routes');
const authMiddleware = require('./Middleware/Auth.Middleware');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'public'));

// Global middleware to check authentication status (optional)
app.use((req, res, next) => {
  // Make auth middleware available to routes
  req.authMiddleware = authMiddleware;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/folders', folderRoutes);

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.info(`Server running on port ${process.env.URL + PORT}`));
