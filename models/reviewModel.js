const mongoose = require('mongoose');

const user = require('./userModel');
const tour = require('./tourModel');

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
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
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

reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name'
  //   }).populate({
  //     path: 'tour',
  //     select: 'name'
  //   });
  this.populate({
    path: 'user',
    select: 'name'
  });

  next();
});

// Review module
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
