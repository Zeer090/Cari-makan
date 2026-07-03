const prisma = require('../config/prisma');

const checkout = async (req, res) => {
  try {
    const { restaurant_id, items, payment_method } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({ success: false, message: 'restaurant_id is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let total_price = 0;
    const orderItemsData = [];

    // Validate all items and calculate total
    for (const item of items) {
      if (!item.menu_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each item must have menu_id and quantity >= 1' });
      }

      const menu = await prisma.menu.findUnique({ where: { id: item.menu_id } });
      if (!menu) {
        return res.status(400).json({ success: false, message: `Menu ${item.menu_id} not found` });
      }
      if (!menu.is_available) {
        return res.status(400).json({ success: false, message: `Menu "${menu.name}" is currently unavailable` });
      }
      if (menu.restaurant_id !== restaurant_id) {
        return res.status(400).json({ success: false, message: 'Cannot mix items from different restaurants' });
      }

      const qty = parseInt(item.quantity);
      total_price += parseFloat(menu.price) * qty;

      orderItemsData.push({
        menu_id: menu.id,
        quantity: qty,
        price_at_order: menu.price,
      });
    }

    // Create Order with items in a transaction
    const order = await prisma.order.create({
      data: {
        user_id: req.user.id,
        restaurant_id,
        total_price,
        status: payment_method === 'cash' ? 'processing' : 'pending',
        payment_status: payment_method === 'cash' ? 'paid' : 'unpaid',
        payment_method: payment_method || 'midtrans',
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { menu: true } },
        restaurant: true,
      },
    });

    // If cash, automatically create a successful payment record
    if (payment_method === 'cash') {
      await prisma.payment.create({
        data: {
          order_id: order.id,
          transaction_status: 'capture',
          payment_type: 'cash',
          gross_amount: total_price,
          paid_at: new Date(),
        }
      });
    }

    // Emit event to restaurant owner's room
    if (global.io && order.restaurant?.owner_id) {
      global.io.to(order.restaurant.owner_id).emit('newOrder', {
        orderId: order.id,
        message: 'Pesanan baru masuk!'
      });
    }

    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ success: false, message: 'Server error during checkout' });
  }
};

const getHistory = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: req.user.id },
      include: {
        items: { include: { menu: true } },
        restaurant: true,
        payment: true,
        review: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menu: true } },
        restaurant: true,
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Allow owner or admin to view
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if the user is the owner of the order
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({ success: false, message: 'Order must be shipped before it can be completed' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'completed' },
    });

    res.json({ success: true, message: 'Order marked as completed', data: updatedOrder });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    console.log(`[DELETE ORDER] Attempting to delete order: ${req.params.id}`);
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      console.log(`[DELETE ORDER] Order ${id} not found`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if the user is the owner of the order
    if (order.user_id !== req.user.id) {
      console.log(`[DELETE ORDER] Unauthorized. Order user: ${order.user_id}, Req user: ${req.user.id}`);
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.status !== 'pending') {
      console.log(`[DELETE ORDER] Order ${id} status is ${order.status}, not pending`);
      return res.status(400).json({ success: false, message: 'Only pending orders can be deleted' });
    }

    console.log(`[DELETE ORDER] Proceeding with transaction for ${id}`);
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { order_id: id } }),
      prisma.payment.deleteMany({ where: { order_id: id } }),
      prisma.review.deleteMany({ where: { order_id: id } }), // Just in case
      prisma.order.delete({ where: { id } })
    ]);

    console.log(`[DELETE ORDER] Successfully deleted order ${id}`);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('[DELETE ORDER] Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { checkout, getHistory, getOrderById, completeOrder, deleteOrder };
