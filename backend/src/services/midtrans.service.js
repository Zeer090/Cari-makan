const midtransClient = require('midtrans-client');

// Snap is used for front-end popup payment
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// Core API is needed for server-side webhook verification
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

const createTransaction = async (orderId, grossAmount, customerDetails) => {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(grossAmount), // Midtrans requires integer for IDR
    },
    customer_details: customerDetails,
    credit_card: { secure: true },
  };

  const transaction = await snap.createTransaction(parameter);
  return transaction.token; // Returns snap_token
};

module.exports = { snap, coreApi, createTransaction };
