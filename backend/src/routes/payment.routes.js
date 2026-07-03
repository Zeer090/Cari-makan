const express = require('express');
const { generateSnapToken, handleWebhook, checkPaymentStatus } = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/create-transaction', authenticate, generateSnapToken);
router.post('/notification', handleWebhook); // Midtrans webhook (legacy endpoint name)
router.post('/webhook', handleWebhook);      // Midtrans webhook (new endpoint name)

// Auto-check payment status
router.get('/check-status/:orderId', authenticate, checkPaymentStatus);

// Redirect pages after Midtrans payment (for non-popup payment methods)
router.get('/finish', (req, res) => res.redirect(`${FRONTEND_URL}/orders?payment=success`));
router.get('/unfinish', (req, res) => res.redirect(`${FRONTEND_URL}/orders?payment=pending`));
router.get('/error', (req, res) => res.redirect(`${FRONTEND_URL}/orders?payment=error`));

module.exports = router;

