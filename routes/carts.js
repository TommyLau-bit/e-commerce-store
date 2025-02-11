const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');  // Only logged-in users can manage carts
const pool = require('../config/db');  // Database connection

// 1. Add Product to Cart
router.post('/add', authenticateToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  try {
    // Check if the user already has a cart
    let cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (cart.rows.length === 0) {
      cart = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    }

    const cartId = cart.rows[0].id;

    // Check if the product already exists in the cart
    const existingItem = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, product_id]);
    if (existingItem.rows.length > 0) {
      // Update quantity if item already exists
      await pool.query('UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3', [quantity, cartId, product_id]);
    } else {
      // Insert new product if it doesn't exist in the cart
      await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)', [cartId, product_id, quantity]);
    }

    res.status(200).json({ msg: 'Product added to cart' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Cart Contents
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
  
    try {
      // Get the user's cart
      const cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  
      if (cart.rows.length === 0) {
        return res.status(404).json({ msg: 'No cart found for this user' });
      }
  
      const cartId = cart.rows[0].id;
  
      // Get items in the cart with product details
      const cartItems = await pool.query(`
        SELECT 
          ci.product_id,
          p.name,
          p.price,
          ci.quantity,
          (p.price * ci.quantity) AS total_price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [cartId]);
  
      if (cartItems.rows.length === 0) {
        return res.status(200).json({ msg: 'Your cart is empty', items: [] });
      }
  
      res.status(200).json({
        cart_id: cartId,
        items: cartItems.rows
      });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Update Product Quantity in Cart
router.put('/update', authenticateToken, async (req, res) => {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;
  
    try {
      // Get the user's cart
      const cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  
      if (cart.rows.length === 0) {
        return res.status(404).json({ msg: 'No cart found for this user' });
      }
  
      const cartId = cart.rows[0].id;
  
      // Check if the product exists in the cart
      const existingItem = await pool.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, product_id]
      );
  
      if (existingItem.rows.length === 0) {
        return res.status(404).json({ msg: 'Product not found in cart' });
      }
  
      if (quantity <= 0) {
        // Remove the product from the cart if quantity is zero or negative
        await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, product_id]);
        return res.status(200).json({ msg: 'Product removed from cart' });
      } else {
        // Update the quantity
        await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
          [quantity, cartId, product_id]
        );
        return res.status(200).json({ msg: 'Product quantity updated' });
      }
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Remove Product from Cart
router.delete('/remove', authenticateToken, async (req, res) => {
    const { product_id } = req.body;
    const userId = req.user.id;
  
    try {
      // Get the user's cart
      const cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  
      if (cart.rows.length === 0) {
        return res.status(404).json({ msg: 'No cart found for this user' });
      }
  
      const cartId = cart.rows[0].id;
  
      // Check if the product exists in the cart
      const existingItem = await pool.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, product_id]
      );
  
      if (existingItem.rows.length === 0) {
        return res.status(404).json({ msg: 'Product not found in cart' });
      }
  
      // Delete the product from the cart
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, product_id]);
  
      res.status(200).json({ msg: 'Product removed from cart' });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

// Export the cart routes
module.exports = router;