const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative']
    },
    image: {
      type: String,
      required: [true, 'Image URL is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 24
    },
    prepTime: {
      type: String,
      default: '20-30 min'
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    availability: {
      type: Boolean,
      default: true
    },
    calories: {
      type: Number,
      default: 350
    },
    dietary: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Index for search optimization
foodSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Food', foodSchema);
