const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: { 
      type: String, 
      required: true, 
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['customer', 'merchant'], 
      required: true 
    },
    profile: {
      name: { type: String, trim: true },
      phone: { type: String, match: /^[0-9]{10,15}$/ },
      avatar: { type: String, default: 'default-avatar.jpg' }
    },
    merchantDetails: {
      businessName: { type: String, trim: true },
      businessRegistration: { type: String, unique: true, sparse: true }
    }
  }, { timestamps: true });

  module.exports = mongoose.model('User', userSchema);