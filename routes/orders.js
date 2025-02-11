const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');  // Only logged-in users can place orders
const pool = require('../config/db');  // Database connection

// Place Order from Cart
router.post('/place', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Get the user's cart
    const cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);

    if (cart.rows.length === 0) {
      return res.status(400).json({ msg: 'No cart found for this user' });
    }

    const cartId = cart.rows[0].id;

    // Get cart items
    const cartItems = await pool.query(`
      SELECT ci.product_id, p.price, ci.quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ msg: 'Your cart is empty' });
    }

    // Calculate total order amount
    const total = cartItems.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create a new order
    const newOrder = await pool.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
      [userId, total]
    );

    const orderId = newOrder.rows[0].id;

    // Insert cart items into order_items and update product stock
    for (const item of cartItems.rows) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Update product stock
      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear the cart
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    res.status(201).json({ msg: 'Order placed successfully', order_id: orderId });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Order History for Logged-in User
router.get('/history', authenticateToken, async (req, res) => {
    const userId = req.user.id;
  
    try {
      // Get all orders for the user
      const orders = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  
      if (orders.rows.length === 0) {
        return res.status(404).json({ msg: 'No orders found for this user' });
      }
  
      // For each order, get the associated products
      const orderDetails = await Promise.all(orders.rows.map(async (order) => {
        const items = await pool.query(`
          SELECT oi.product_id, p.name, oi.quantity, oi.price_at_purchase
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);
  
        return {
          order_id: order.id,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
          items: items.rows
        };
      }));
  
      res.json(orderDetails);
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

// View All Orders (Admin Only)
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
    try {
      // Get all orders with user information
      const orders = await pool.query(`
        SELECT o.id AS order_id, o.total, o.status, o.created_at, u.username, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);
  
      // For each order, get the associated products
      const allOrderDetails = await Promise.all(orders.rows.map(async (order) => {
        const items = await pool.query(`
          SELECT oi.product_id, p.name, oi.quantity, oi.price_at_purchase
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.order_id]);
  
        return {
          order_id: order.order_id,
          user: {
            username: order.username,
            email: order.email
          },
          total: order.total,
          status: order.status,
          created_at: order.created_at,
          items: items.rows
        };
      }));
  
      res.json(allOrderDetails);
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Update Order Status (Admin Only)
router.put('/update-status/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    // Valid statuses
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
  
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid order status' });
    }
  
    try {
      const updatedOrder = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
  
      if (updatedOrder.rows.length === 0) {
        return res.status(404).json({ msg: 'Order not found' });
      }
  
      res.json({ msg: 'Order status updated successfully', order: updatedOrder.rows[0] });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Delete an Order (Admin Only)
router.delete('/delete/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedOrder = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
  
      if (deletedOrder.rows.length === 0) {
        return res.status(404).json({ msg: 'Order not found' });
      }
  
      res.json({ msg: 'Order deleted successfully' });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;