const prisma = require('../config/prisma');

const getAllRestaurants = async (req, res) => {
  try {
    const { category, search, sort = 'rating', page = 1, limit = 10 } = req.query;

    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = {};
    if (sort === 'rating') orderBy.rating = 'desc';
    else if (sort === 'newest') orderBy.id = 'desc';
    else orderBy.rating = 'desc';

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [total, restaurants] = await Promise.all([
      prisma.restaurant.count({ where }),
      prisma.restaurant.findMany({
        where,
        include: { menus: { where: { is_available: true } } },
        orderBy,
        skip,
        take: limitNumber,
      })
    ]);

    res.json({
      success: true,
      data: restaurants,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { menus: true },
    });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, category } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, message: 'Name and address are required' });
    }

    const owner_id = req.user.id;
    
    // Check if user already has a restaurant
    const existingRestaurant = await prisma.restaurant.findFirst({ where: { owner_id } });
    if (existingRestaurant) {
      return res.status(400).json({ success: false, message: 'You already have a restaurant' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const restaurant = await prisma.restaurant.create({
      data: { name, description, address, category, owner_id, image_url },
    });
    
    // Update user role to restaurant_owner
    const updatedUser = await prisma.user.update({
      where: { id: owner_id },
      data: { role: 'restaurant_owner' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        google_id: true,
        created_at: true,
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Restaurant created successfully', 
      data: { restaurant, user: updatedUser } 
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRestaurantMenus = async (req, res) => {
  try {
    const { id } = req.params;
    const menus = await prisma.menu.findMany({ where: { restaurant_id: id } });
    res.json({ success: true, data: menus });
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createMenu = async (req, res) => {
  try {
    const { restaurant_id, name, description, price } = req.body;
    if (!restaurant_id || !name || !price) {
      return res.status(400).json({ success: false, message: 'restaurant_id, name, and price are required' });
    }

    // Only the restaurant owner can add menus
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurant_id } });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: you do not own this restaurant' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const menu = await prisma.menu.create({
      data: { restaurant_id, name, description, price: parseFloat(price), image_url },
    });
    res.status(201).json({ success: true, message: 'Menu created', data: menu });
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { name, description, price, is_available } = req.body;

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: true },
    });
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    if (menu.restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : menu.image_url;

    const updated = await prisma.menu.update({
      where: { id: menuId },
      data: {
        name: name || menu.name,
        description: description !== undefined ? description : menu.description,
        price: price ? parseFloat(price) : menu.price,
        is_available: is_available !== undefined ? is_available === 'true' || is_available === true : menu.is_available,
        image_url,
      },
    });
    res.json({ success: true, message: 'Menu updated', data: updated });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteMenu = async (req, res) => {
  try {
    const { menuId } = req.params;

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: true },
    });
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    if (menu.restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.menu.delete({ where: { id: menuId } });
    res.json({ success: true, message: 'Menu deleted' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  getRestaurantMenus,
  createMenu,
  updateMenu,
  deleteMenu,
};
