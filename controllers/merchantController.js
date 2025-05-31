const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Get all orders for logged-in merchant with enhanced filtering
exports.getOrders = async (req, res) => {
  const merchantId = req.user._id;
  const { status } = req.query; // Allow filtering by status

  try {
    // Find restaurants belonging to the merchant
    const restaurants = await Restaurant.find({ merchant: merchantId });
    const restaurantIds = restaurants.map(r => r._id);

    if (!restaurantIds.length) {
      return res.json([]);
    }

    const query = { 
      stall: { $in: restaurantIds }
    };

    // Add status filter if provided
    if (status && ['pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected'].includes(status)) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: 'items.menuItem',
        select: 'name price category preparationTime',
        model: MenuItem
      })
      .populate({
        path: 'stall',
        select: 'name openingHours',
        model: Restaurant
      })
      .populate({
        path: 'customer',
        select: 'name phone',
        model: 'User'
      })
      .sort({ createdAt: -1 }); // Newest orders first

    res.json(orders);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      details: error.message 
    });
  }
};

// Update order status with validation
exports.updateOrderStatus = async (req, res) => {
  const merchantId = req.user._id;
  const { orderId } = req.params;
  const { status } = req.body;

  if (!['accepted', 'preparing', 'ready', 'completed', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Verify merchant owns the restaurant associated with the order
    const order = await Order.findOne({ _id: orderId })
      .populate({
        path: 'stall',
        select: 'merchant',
        model: Restaurant
      });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.stall.merchant.toString() !== merchantId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: ['preparing', 'rejected'],
      preparing: ['ready', 'rejected'],
      ready: ['completed'],
      rejected: [],
      completed: []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    order.status = status;
    
    // Set timestamps for important status changes
    if (status === 'accepted') {
      order.acceptedAt = new Date();
    } else if (status === 'completed') {
      order.completedAt = new Date();
    }

    await order.save();
    
    res.json({ 
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update order', 
      details: error.message 
    });
  }
};

// Create Restaurant with enhanced data
exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, location, address, openingHours } = req.body;
    
    // Validate location coordinates
    if (location && location.coordinates) {
      if (location.coordinates.length !== 2 || 
          !location.coordinates.every(coord => typeof coord === 'number')) {
        return res.status(400).json({ error: 'Invalid location coordinates' });
      }
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      location,
      address,
      openingHours,
      merchant: req.user._id
    });

    res.status(201).json(restaurant);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(400).json({ 
      error: 'Failed to create restaurant',
      details: err.message 
    });
  }
};

// Create Menu Item with enhanced data
exports.createMenuItem = async (req, res) => {
  try {
    const { 
      name, 
      price, 
      stallId, 
      category, 
      description, 
      preparationTime, 
      dietaryTags 
    } = req.body;

    // Verify the stall belongs to the merchant
    const stall = await Restaurant.findOne({ 
      _id: stallId, 
      merchant: req.user._id 
    });

    if (!stall) {
      return res.status(403).json({ error: 'Not authorized to add items to this stall' });
    }

    const item = await MenuItem.create({
      name,
      price,
      stall: stallId,
      category,
      description,
      preparationTime,
      dietaryTags
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ 
      error: 'Failed to create menu item',
      details: err.message 
    });
  }
};

// Get menu items for a specific stall
exports.getMenuItems = async (req, res) => {
  try {
    const { stallId } = req.params;
    
    // Verify the stall belongs to the merchant
    const stall = await Restaurant.findOne({ 
      _id: stallId, 
      merchant: req.user._id 
    });

    if (!stall) {
      return res.status(403).json({ error: 'Not authorized to view this stall\'s menu' });
    }

    const items = await MenuItem.find({ stall: stallId })
      .sort({ category: 1, name: 1 }); // Sort by category then name

    res.json(items);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch menu items', 
      details: error.message 
    });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;

    // First find the item to get its stall
    const item = await MenuItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Verify the stall belongs to the merchant
    const stall = await Restaurant.findOne({ 
      _id: item.stall, 
      merchant: req.user._id 
    });

    if (!stall) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    // Prevent changing the stall of an item
    if (updateData.stall && updateData.stall !== item.stall.toString()) {
      return res.status(400).json({ error: 'Cannot change item\'s stall' });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      itemId, 
      updateData, 
      { new: true, runValidators: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to update menu item', 
      details: error.message 
    });
  }
};