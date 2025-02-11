const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');  // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const { check, validationResult } = require('express-validator');  // For input validation
const pool = require('../config/db');  // Database connection
const { authenticateToken, isAdmin } = require('../middleware/auth');  // Correct: Destructure both functions


// Register a new user (with optional admin role)
router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { username, email, password, role } = req.body;  // Add role to request body
  
    try {
      // Check if the user already exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Default role is 'user' if not specified
      const userRole = role && role === 'admin' ? 'admin' : 'user';
  
      // Insert new user into the database with role
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, hashedPassword, userRole]
      );
  
      // Create JWT token using newUser data
      const payload = { id: newUser.rows[0].id, role: newUser.rows[0].role };  
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

// User login
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Compare the password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
    // Create JWT token
    const payload = { id: user.rows[0].id, role: user.rows[0].role };  
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


  // Protected route to get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const user = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
  
      if (user.rows.length === 0) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      res.json(user.rows[0]);  // Send the user's profile data
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;