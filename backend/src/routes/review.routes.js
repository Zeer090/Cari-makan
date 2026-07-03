const express = require('express');
const { createReview, getRestaurantReviews } = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/orders/:orderId/review', authenticate, createReview);
router.get('/restaurants/:restaurantId/reviews', getRestaurantReviews);

module.exports = router;
