const express = require('express');
const { toggleFavorite, getUserFavorites } = require('../controllers/favorite.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/restaurants/:restaurantId/favorite', toggleFavorite);
router.get('/user/favorites', getUserFavorites);

module.exports = router;
