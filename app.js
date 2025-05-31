const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resturant', require('./routes/resturantRoutes'));
app.use('/api/merchant', require('./routes/merchantRoutes'));

app.get('/healthchecker', (req, res) => {
    res.send('Server is running');
});


module.exports = app;