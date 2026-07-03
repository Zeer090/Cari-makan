const prisma = require('../config/prisma');

const createReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if order exists, belongs to user, and is completed
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user_id !== user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });
    if (order.status !== 'completed') return res.status(400).json({ success: false, message: 'Order must be completed to review' });

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({ where: { order_id: orderId } });
    if (existingReview) return res.status(400).json({ success: false, message: 'You have already reviewed this order' });

    const review = await prisma.review.create({
      data: {
        order_id: orderId,
        user_id,
        restaurant_id: order.restaurant_id,
        rating: parseInt(rating),
        comment
      }
    });

    // Update restaurant average rating
    const allReviews = await prisma.review.findMany({
      where: { restaurant_id: order.restaurant_id }
    });

    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await prisma.restaurant.update({
      where: { id: order.restaurant_id },
      data: { rating: avgRating }
    });

    res.status(201).json({ success: true, message: 'Review added', data: review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { restaurant_id: restaurantId },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createReview, getRestaurantReviews };
