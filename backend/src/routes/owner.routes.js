const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getMyRestaurant,
  getRestaurantOrders,
  updateOrderStatus,
  getDashboardStats,
  updateMyRestaurant
} = require('../controllers/owner.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);
  cb(null, isValid);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Apply middleware to all routes in this file
router.use(authenticate);
router.use(authorize(['restaurant_owner', 'admin']));

router.get('/restaurant', getMyRestaurant);
router.put('/restaurant', upload.single('image'), updateMyRestaurant);
router.get('/orders', getRestaurantOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.get('/stats', getDashboardStats);

module.exports = router;
