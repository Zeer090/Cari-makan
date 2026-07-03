const prisma = require('../config/prisma');
const { coreApi, createTransaction } = require('../services/midtrans.service');

const generateSnapToken = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    // Validate order exists and belongs to the authenticated user
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
    }
    if (order.payment_status === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const customerDetails = {
      first_name: order.user.name.split(' ')[0],
      last_name: order.user.name.split(' ').slice(1).join(' ') || '',
      email: order.user.email,
      phone: order.user.phone || '08123456789',
    };

    const token = await createTransaction(order.id, parseFloat(order.total_price), customerDetails);
    res.json({ success: true, data: { snap_token: token } });
  } catch (error) {
    console.error('Error generating snap token:', error);
    res.status(500).json({
      success: false,
      message: error?.ApiResponse?.error_messages?.[0] || 'Failed to create payment transaction',
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    // Use CoreApi for webhook notification verification (not Snap)
    const statusResponse = await coreApi.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Webhook: Order ${orderId} | Status: ${transactionStatus} | Fraud: ${fraudStatus}`);

    let orderStatus = 'pending';
    let paymentStatus = 'unpaid';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        paymentStatus = 'paid';
        orderStatus = 'processing';
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'paid';
      orderStatus = 'processing';
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      paymentStatus = 'failed';
      orderStatus = 'cancelled';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'unpaid';
      orderStatus = 'pending';
    }

    // Update Order
    await prisma.order.update({
      where: { id: orderId },
      data: { payment_status: paymentStatus, status: orderStatus },
    });

    // Upsert Payment record
    await prisma.payment.upsert({
      where: { order_id: orderId },
      update: {
        transaction_status: transactionStatus,
        payment_type: statusResponse.payment_type,
        gross_amount: parseFloat(statusResponse.gross_amount),
        midtrans_transaction_id: statusResponse.transaction_id,
        paid_at: paymentStatus === 'paid' ? new Date() : null,
      },
      create: {
        order_id: orderId,
        transaction_status: transactionStatus,
        payment_type: statusResponse.payment_type,
        gross_amount: parseFloat(statusResponse.gross_amount),
        midtrans_transaction_id: statusResponse.transaction_id,
        paid_at: paymentStatus === 'paid' ? new Date() : null,
      },
    });

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to Midtrans so it doesn't retry
    res.status(200).json({ success: false, message: 'Webhook processing failed but acknowledged' });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // Ask Midtrans for the latest status
    const statusResponse = await coreApi.transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let orderStatus = order.status;
    let paymentStatus = order.payment_status;

    if (transactionStatus === 'capture' && fraudStatus === 'accept') {
      paymentStatus = 'paid';
      orderStatus = 'processing';
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'paid';
      orderStatus = 'processing';
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      paymentStatus = 'failed';
      orderStatus = 'cancelled';
    }

    // Update if status changed
    if (orderStatus !== order.status || paymentStatus !== order.payment_status) {
      await prisma.order.update({
        where: { id: orderId },
        data: { payment_status: paymentStatus, status: orderStatus },
      });

      await prisma.payment.upsert({
        where: { order_id: orderId },
        update: {
          transaction_status: transactionStatus,
          payment_type: statusResponse.payment_type,
          gross_amount: parseFloat(statusResponse.gross_amount),
          midtrans_transaction_id: statusResponse.transaction_id,
          paid_at: paymentStatus === 'paid' ? new Date() : null,
        },
        create: {
          order_id: orderId,
          transaction_status: transactionStatus,
          payment_type: statusResponse.payment_type,
          gross_amount: parseFloat(statusResponse.gross_amount),
          midtrans_transaction_id: statusResponse.transaction_id,
          paid_at: paymentStatus === 'paid' ? new Date() : null,
        },
      });
    }

    res.json({ success: true, data: { orderStatus, paymentStatus, transactionStatus } });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ success: false, message: 'Failed to check payment status' });
  }
};

module.exports = { generateSnapToken, handleWebhook, checkPaymentStatus };

