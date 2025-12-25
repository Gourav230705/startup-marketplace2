const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files
const path = require('path');
console.log('Static Path:', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/startups', require('./routes/startupRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/resource-requests', require('./routes/resourceRequestRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.get('/api', (req, res) => {
    res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
