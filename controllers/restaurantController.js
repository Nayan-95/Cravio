const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Get nearby restaurants (within 5km radius)
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 5000 // 5km in meters
        }
      },
      isActive: true
    }).select('-merchant -createdAt -updatedAt -__v');

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch restaurants',
      details: error.message 
    });
  }
};

// Get restaurant details with menu categories
exports.getRestaurantMenu = async (req, res) => {
  const { restaurantId } = req.params;
  
  try {
    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId)
      .select('-merchant -createdAt -updatedAt -__v');
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get menu items grouped by categories
    const menuItems = await MenuItem.aggregate([
      { $match: { restaurant: restaurant._id, isAvailable: true } },
      { $group: {
          _id: "$category",
          items: { $push: "$$ROOT" }
        }
      },
      { $project: {
          category: "$_id",
          items: {
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            preparationTime: 1,
            imageUrl: 1,
            dietaryTags: 1
          }
        }
      }
    ]);

    res.json({
      restaurant,
      menu: menuItems
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch menu',
      details: error.message 
    });
  }
};

// Place an order with multiple items
exports.placeOrder = async (req, res) => {
  const userId = req.user._id;
  const { restaurantId, items, specialInstructions } = req.body;
  
  try {
    // Validate input
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Verify all menu items exist and belong to the restaurant
    const menuItems = await MenuItem.find({
      _id: { $in: items.map(item => item.menuItemId) },
      restaurant: restaurantId
    });

    if (menuItems.length !== items.length) {
      return res.status(400).json({ error: 'Some items are invalid or not from this restaurant' });
    }

    // Calculate total price and preparation time
    let totalPrice = 0;
    let maxPreparationTime = 0;
    
    const orderItems = items.map(item => {
      const menuItem = menuItems.find(mi => mi._id.equals(item.menuItemId));
      totalPrice += menuItem.price * item.quantity;
      maxPreparationTime = Math.max(maxPreparationTime, menuItem.preparationTime);
      
      return {
        menuItem: item.menuItemId,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      };
    });

    // Create order
    const order = await Order.create({
      customer: userId,
      stall: restaurantId,
      merchant: restaurant.merchant,
      items: orderItems,
      status: 'pending',
      estimatedWaitTime: maxPreparationTime,
      specialInstructions,
      totalPrice
    });

    // Populate data for response
    const populatedOrder = await Order.findById(order._id)
      .populate('stall', 'name')
      .populate('items.menuItem', 'name price');

    res.status(201).json({
      message: 'Order placed successfully',
      order: populatedOrder
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to place order',
      details: error.message 
    });
  }
};