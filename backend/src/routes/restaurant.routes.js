const express = require('express');
const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  getRestaurantMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} = require('../controllers/restaurant.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
                  allowedTypes.test(file.mimetype);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp) are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

const router = express.Router();

// --- Public routes ---
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menus', getRestaurantMenus);

// --- Protected routes (restaurant_owner only) ---
// Create a restaurant
router.post('/', authenticate, upload.single('image'), createRestaurant);

// Create a menu — note: /api/restaurants/menus (avoids :id clash)
router.post('/menus/add', authenticate, authorize(['restaurant_owner']), upload.single('image'), createMenu);

// Update and delete a specific menu
router.put('/menus/:menuId', authenticate, authorize(['restaurant_owner']), upload.single('image'), updateMenu);
router.delete('/menus/:menuId', authenticate, authorize(['restaurant_owner']), deleteMenu);

module.exports = router;
