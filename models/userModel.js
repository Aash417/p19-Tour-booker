const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Create a schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name.!'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide a email.!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password.!'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password.!'],
    validate: {
      // this only works on save & create.
      validator: function(el) {
        return el === this.password;
      },
      message: 'password are not the same'
    }
  }
});

userSchema.pre('save', async function(next) {
  // Only run this function if password is modified
  if (!this.isModified('password')) return next();

  // Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the confirm password cause it wont be need to put it into the db
  this.passwordConfirm = undefined;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
