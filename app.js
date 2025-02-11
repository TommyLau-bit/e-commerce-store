require('dotenv').config();  // Load environment variables
const express = require('express');
const app = express();
const pool = require('./config/db');  // Import the database connection
const userRoutes = require('./routes/users');  // Import user routes
const productRoutes = require('./routes/products');  // Import product routes
const cartRoutes = require('./routes/carts');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');

// Load Swagger documentation
const swaggerDocument = YAML.load('./docs/api-docs.yaml');


app.use(express.json());

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));


// Test route to check database connection
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');  // Query the current timestamp from PostgreSQL
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Use the user routes for authentication
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Test route to check server
app.get('/', (req, res) => {
    res.send('E-commerce API');
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});