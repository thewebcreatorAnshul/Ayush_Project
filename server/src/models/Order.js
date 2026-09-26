const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: String,
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'PICKED UP', 'DELIVERED'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 0
    },
    tax: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
      instructions: { type: String, default: '' }
    },
    paymentMethod: {
      type: String,
      enum: ['Card', 'Cash on Delivery', 'UPI'],
      default: 'Card'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Completed'
    },
    status: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'PICKED UP', 'DELIVERED'],
      default: 'PLACED'
    },
    estimatedDelivery: {
      type: Date,
      required: true
    },
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true
  }
);

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
