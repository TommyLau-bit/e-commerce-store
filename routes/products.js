const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');  // Import JWT and admin middleware
const pool = require('../config/db');  // Import database connection



// Get all products (Accessible to all users)
router.get('/', async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products');
    res.json(products.rows);  // Send the list of products
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a specific product by ID (Accessible to all users)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  
      if (product.rows.length === 0) {
        return res.status(404).json({ msg: 'Product not found' });
      }
  
      res.json(product.rows[0]);  // Send the product details
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Create a new product (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    const { name, description, price, stock, category } = req.body;
  
    try {
      const newProduct = await pool.query(
        'INSERT INTO products (name, description, price, stock, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, stock, category]
      );
  
      res.status(201).json(newProduct.rows[0]);  // Send the created product
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Update a product by ID (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;
  
    try {
      const updatedProduct = await pool.query(
        'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5 WHERE id = $6 RETURNING *',
        [name, description, price, stock, category, id]
      );
  
      if (updatedProduct.rows.length === 0) {
        return res.status(404).json({ msg: 'Product not found' });
      }
  
      res.json(updatedProduct.rows[0]);  // Send the updated product
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Delete a product by ID (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedProduct = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
  
      if (deletedProduct.rows.length === 0) {
        return res.status(404).json({ msg: 'Product not found' });
      }
  
      res.json({ msg: 'Product deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


module.exports = router;