require('dotenv').config();  // Load environment variables
const express = require('express');
const app = express();
const pool = require('./config/db');  // Import the database connection

app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});