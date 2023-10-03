const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// Create a JWT token with user's ID
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Sends user a response with a token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  user.active = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  createSendToken(newUser, 200, res);
  //   const token = signToken(newUser._id);

  //   res.status(200).json({
  //     status: 'success',
  //     token,
  //     data: {
  //       user: newUser
  //     }
  //   });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  //   const correct = await user.correctPasssword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email and passoword', 401));
  }
  // 3. If everything onkeydown, send token to client
  createSendToken(user, 200, res);
  //   const token = signToken(user._id);

  //   res.status(200).json({
  //     status: 'success',
  //     id: user.id,
  //     token
  //   });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Get the token and check of its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in, Please login to get access', 401)
    );
  }
  // 2. Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists.',
        401
      )
    );
  }
  // 4. check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password!.. please log in again.')
    );
  }

  //   Grant access to procted route
  req.user = freshUser;
  next();
});
// Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  if (!req.cookies.jwt) return next();
  // 1. verify token
  try {
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    // 2. Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) return next();
    // 3. check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    //   There is a logged in user
    res.locals.user = freshUser;
  } catch (error) {
    return next();
  }

  next();
};

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    // roles is an array['admin' , 'lead-guide'] & role='user'
    if (!role.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email.
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    next(new AppError('There is no user exists with this email address.', 404));

  // 2. Generate the reandom reset
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. send it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password ? Submit a reset password to : ${resetUrl}. \n If you didn't forget your password , please ignore this email.`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: `your password reset token valid for 10 min.`,
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'token send to email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was error while sending the email. Try again.', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });

  // 2. If token has not expired , and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();
  // 3. Update changePasswordAt property for the user

  // 4. Log the user in , send JWT
  createSendToken(user, 200, res);
  //   const token = signToken(user._id);

  //   res.status(200).json({
  //     status: 'success',
  //     id: user.id,
  //     token
  //   });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get the user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong.', 401));

  // 3. If so , update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // User.findByIdAndUpdate will not work as intended
  await user.save();

  // 4. Log the user in & send the jwt
  createSendToken(user, 200, res);
});
