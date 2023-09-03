const mongoose = require('mongoose');

// create a schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'A price must be set']
  },
  rating: {
    type: Number,
    required: true
  }
});

// create a model from schema
const Tour = mongoose.model('Tour', tourSchema);

module.export = Tour;
