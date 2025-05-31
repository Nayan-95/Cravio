const mongoose = require('mongoose');
const { Schema } = mongoose;

const menuItemSchema = new Schema({
  stall: { 
    type: Schema.Types.ObjectId, 
    ref: 'Stall', 
    required: true,
    index: true // Faster querying by stall
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Specials'], // Predefined categories
    default: 'Main Course'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100 // Prevent absurdly long names
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300 // Concise descriptions work better
  },
  price: {
    type: Number,
    required: true,
    min: 0, // No negative prices
    max: 1000 // Prevent accidental million-dollar items
  },
  preparationTime: {
    type: Number,
    min: 1, // Minimum 1 minute
    max: 120, // Max 2 hours
    default: 15 // Average prep time
  },
  isAvailable: {
    type: Boolean,
    default: true // Items are available by default
  },
  imageUrl: {
    type: String,
    default: 'default-food.jpg'
  },
  dietaryTags: [{
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Halal', 'Kosher']
  }]
}, { 
  timestamps: true // Adds createdAt and updatedAt
});

// Compound index for faster menu browsing
menuItemSchema.index({ stall: 1, category: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);