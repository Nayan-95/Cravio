const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const { protect } = require('../middleware/authMiddleware');

// Order routes
router.route('/orders')
  .get(protect, merchantController.getOrders);

router.route('/orders/:orderId/status')
  .put(protect, merchantController.updateOrderStatus);

// Restaurant routes
router.route('/restaurants')
  .post(protect, merchantController.createRestaurant);

// Menu Item routes
router.route('/menu-items')
  .post(protect, merchantController.createMenuItem);

router.route('/menu-items/:stallId')
  .get(protect, merchantController.getMenuItems);

router.route('/menu-items/:itemId')
  .put(protect, merchantController.updateMenuItem);

module.exports = router;