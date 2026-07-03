const express = require('express');
const { getUsers, getRestaurants, verifyRestaurant, getStats } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize(['admin']));

router.get('/users', getUsers);
router.get('/restaurants', getRestaurants);
router.patch('/restaurants/:id/verify', verifyRestaurant);
router.get('/stats', getStats);

module.exports = router;
