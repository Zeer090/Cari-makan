const prisma = require('../config/prisma');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { menus: true, orders: true } },
      },
      orderBy: { rating: 'desc' },
    });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const verifyRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { is_verified: Boolean(is_verified) },
    });
    res.json({ success: true, message: `Restaurant ${is_verified ? 'verified' : 'unverified'}`, data: restaurant });
  } catch (error) {
    console.error('Error verifying restaurant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalRestaurants, totalOrders, paidOrders] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { payment_status: 'paid' },
        _sum: { total_price: true },
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalRevenue: parseFloat(paidOrders._sum.total_price || 0),
        paidOrdersCount: paidOrders._count,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getUsers, getRestaurants, verifyRestaurant, getStats };
