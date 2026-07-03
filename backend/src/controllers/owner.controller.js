const prisma = require('../config/prisma');

// Helper function to get owner's restaurant
const getOwnerRestaurant = async (userId) => {
  return await prisma.restaurant.findFirst({
    where: { owner_id: userId }
  });
};

const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'You do not own a restaurant' });
    }

    const fullRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurant.id },
      include: { menus: true }
    });

    res.json({ success: true, data: fullRestaurant });
  } catch (error) {
    console.error('Error fetching owner restaurant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const orders = await prisma.order.findMany({
      where: { restaurant_id: restaurant.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { menu: true } },
        payment: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Allowed statuses
    const allowedStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const restaurant = await getOwnerRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Check if order belongs to this restaurant
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.restaurant_id !== restaurant.id) {
      return res.status(403).json({ success: false, message: 'You cannot update this order' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    // Emit event to customer's room
    if (global.io) {
      global.io.to(order.user_id).emit('orderStatusUpdated', {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        restaurantName: restaurant.name
      });
    }

    res.json({ success: true, message: 'Order status updated', data: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Total Revenue (only from paid and completed orders)
    const completedOrders = await prisma.order.findMany({
      where: { 
        restaurant_id: restaurant.id,
        status: 'completed',
        payment_status: 'paid'
      }
    });
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

    // Total number of orders
    const totalOrders = await prisma.order.count({
      where: { restaurant_id: restaurant.id }
    });

    // Count by status
    const pendingOrders = await prisma.order.count({
      where: { restaurant_id: restaurant.id, status: 'pending' }
    });
    const processingOrders = await prisma.order.count({
      where: { restaurant_id: restaurant.id, status: 'processing' }
    });

    res.json({ 
      success: true, 
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders: completedOrders.length
      } 
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateMyRestaurant = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { name, description, address, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : restaurant.image_url;

    const updated = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name: name || restaurant.name,
        description: description !== undefined ? description : restaurant.description,
        address: address || restaurant.address,
        category: category || restaurant.category,
        image_url,
      }
    });

    res.json({ success: true, message: 'Restaurant updated', data: updated });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getMyRestaurant,
  getRestaurantOrders,
  updateOrderStatus,
  getDashboardStats,
  updateMyRestaurant
};
