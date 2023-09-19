const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Review cannt be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: { type: Date, default: Date.now },
    tourId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: [true, 'Review must belong to a tour']
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      requrired: [true, 'Review must have a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
