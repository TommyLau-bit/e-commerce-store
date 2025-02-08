const { Pool } = require('pg');  // Import the pg library

// Create a connection pool using environment variables from .env
const pool = new Pool({
  user: process.env.DB_USER,         // PostgreSQL username
  host: process.env.DB_HOST,         // Host (usually localhost)
  database: process.env.DB_NAME,     // Database name (ecommerce)
  password: process.env.DB_PASSWORD, // Password
  port: process.env.DB_PORT          // Port (default is 5432)
});

module.exports = pool;  // Export the connection pool for use in other files