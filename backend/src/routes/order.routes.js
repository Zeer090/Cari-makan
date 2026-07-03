const express = require('express');
const { checkout, getHistory, getOrderById, completeOrder, deleteOrder } = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/checkout', authenticate, checkout);
router.get('/history', authenticate, getHistory);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/complete', authenticate, completeOrder);
router.delete('/:id', authenticate, deleteOrder);

module.exports = router;
