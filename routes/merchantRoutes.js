const express = require('express');
const router = express.Router();
// Make sure the path is correct and the controller exports exist
const merchantController = require('../controllers/merchantController');
const protect = require('../middleware/authMiddleware');

// Fix the routes - ensure all handlers are functions
router.route('/orders')
  .get(protect, merchantController.getOrders); // ← Line 8 in your error

router.route('/orders/:orderId/status')
  .put(protect, merchantController.updateOrderStatus);

router.route('/restaurants')
  .post(protect, merchantController.createRestaurant);

router.route('/menu-items')
  .post(protect, merchantController.createMenuItem);

router.route('/menu-items/:stallId')
  .get(protect, merchantController.getMenuItems);

router.route('/menu-items/:itemId')
  .put(protect, merchantController.updateMenuItem);

console.log('protect is a function:', typeof protect === 'function');
console.log('getOrders is a function:', typeof merchantController.getOrders === 'function');
// Add similar checks for other controller methods

module.exports = router;