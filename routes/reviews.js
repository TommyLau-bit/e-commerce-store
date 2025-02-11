const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');  // Users must be logged in to leave reviews
const pool = require('../config/db');  // Database connection

// Add a Review
router.post('/:product_id', authenticateToken, async (req, res) => {
  const { product_id } = req.params;
  const { rating, review_text } = req.body;
  const userId = req.user.id;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if user has already reviewed this product
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ msg: 'You have already reviewed this product' });
    }

    // Insert new review
    const newReview = await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, product_id, rating, review_text]
    );

    res.status(201).json(newReview.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Reviews for a Product
router.get('/:product_id', async (req, res) => {
  const { product_id } = req.params;

  try {
    const reviews = await pool.query(
      'SELECT r.id, u.username, r.rating, r.review_text, r.created_at FROM reviews r JOIN users u ON r.user_id = u.id WHERE product_id = $1',
      [product_id]
    );

    // Calculate average rating
    const avgRating = await pool.query(
      'SELECT AVG(rating)::numeric(2,1) AS average_rating FROM reviews WHERE product_id = $1',
      [product_id]
    );

    res.json({ average_rating: avgRating.rows[0].average_rating || 0, reviews: reviews.rows });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Edit a Review
router.put('/:review_id', authenticateToken, async (req, res) => {
  const { review_id } = req.params;
  const { rating, review_text } = req.body;
  const userId = req.user.id;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
  }

  try {
    // Ensure user owns the review
    const review = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [review_id, userId]
    );

    if (review.rows.length === 0) {
      return res.status(403).json({ msg: 'You are not authorized to edit this review' });
    }

    // Update the review
    const updatedReview = await pool.query(
      'UPDATE reviews SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [rating, review_text, review_id]
    );

    res.json(updatedReview.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a Review
router.delete('/:review_id', authenticateToken, async (req, res) => {
  const { review_id } = req.params;
  const userId = req.user.id;

  try {
    // Ensure user owns the review
    const review = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [review_id, userId]
    );

    if (review.rows.length === 0) {
      return res.status(403).json({ msg: 'You are not authorized to delete this review' });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [review_id]);

    res.json({ msg: 'Review deleted successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;