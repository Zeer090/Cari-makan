const prisma = require('../config/prisma');

const toggleFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const user_id = req.user.id;

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { user_id_restaurant_id: { user_id, restaurant_id: restaurantId } }
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ success: true, message: 'Removed from favorites', favorited: false });
    } else {
      await prisma.favorite.create({
        data: { user_id, restaurant_id: restaurantId }
      });
      return res.status(201).json({ success: true, message: 'Added to favorites', favorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;
    const favorites = await prisma.favorite.findMany({
      where: { user_id },
      include: {
        restaurant: {
          select: { id: true, name: true, category: true, image_url: true, rating: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { toggleFavorite, getUserFavorites };
