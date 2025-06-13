const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // Install with npm install yamljs
// Load the YAML file
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
app.use(cors('*'));


// Middleware
app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resturant', require('./routes/resturantRoutes'));
app.use('/api/merchant', require('./routes/merchantRoutes'));

app.get('/healthchecker', (req, res) => {
    res.send('Server is running');
});


module.exports = app;