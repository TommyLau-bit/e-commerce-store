const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const passport = require('passport');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    const products = await pool.query(query, params);
    res.json(products.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin routes
router.use(passport.authenticate('jwt', { session: false }), (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
});

// Create product
router.post('/', async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  try {
    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, stock, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, stock, category]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;