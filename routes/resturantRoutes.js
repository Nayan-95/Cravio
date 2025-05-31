const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/restaurants/nearby', restaurantController.getNearbyRestaurants);
router.get('/restaurants/:restaurantId/menu', restaurantController.getRestaurantMenu);
router.post('/orders', authMiddleware, restaurantController.placeOrder);

module.exports = router;
