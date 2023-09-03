const mongoose = require('mongoose');

// create a schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A price must be set']
  },
  ratingAverage: {
    type: Number,
    default: 4.5
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration.']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'Must have a difficulty']
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true,
    required: true
  },
  imageCover: {
    type: String,
    required: [true, 'must have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date]
});

// create a model from schema
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
