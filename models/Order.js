const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    customer: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    stall: { 
        type: Schema.Types.ObjectId, 
        ref: 'Stall', 
        required: true 
    },
    items: [{
        menuItem: { 
            type: Schema.Types.ObjectId, 
            ref: 'MenuItem', 
            required: true 
        },
        quantity: { 
            type: Number, 
            default: 1,
            min: 1 
        },
        specialInstructions: { 
            type: String, 
            maxlength: 200 
        }
    }],
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected'],
        default: 'pending'
    },
    queuePosition: { 
        type: Number, 
        min: 1 
    },
    estimatedWaitTime: { 
        type: Number, 
        min: 0 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'refunded'], 
        default: 'pending' 
    }
}, { timestamps: true });

// Indexes for faster queries
orderSchema.index({ customer: 1 });
orderSchema.index({ stall: 1, status: 1 });

// Virtual for total price
orderSchema.virtual('totalPrice').get(function() {
    // Note: Requires `.populate('items.menuItem')` when querying
    if (!this.items || !this.items[0].menuItem) return 0;
    return this.items.reduce((total, item) => {
        return total + (item.menuItem.price * item.quantity);
    }, 0);
});

module.exports = mongoose.model('Order', orderSchema);
