const mongoose = require('mongoose');
const { Schema } = mongoose;

const restaurantSchema = new Schema({
    merchant: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    description: { type: String, maxlength: 500 },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [long, lat]
    },
    address: { type: String, required: true },
    openingHours: [{
        day: { 
            type: Number, 
            required: true,
            min: 0, 
            max: 6 
        },
        open: { 
            type: String, 
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
        },
        close: { 
            type: String, 
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ 
        }
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Geospatial index for nearby searches
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
