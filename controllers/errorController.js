const AppError = require('../utils/appError');

// Cast Error
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
// Duplication Error
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value :${value}  , please use another value`;
  return new AppError(message, 400);
};
// Validation Error
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
// JWT Error
const handleJWTError = () =>
  new AppError('Invalid Token , please login again.!', 401);
// JWT token expiration error
const handleJWTExpirerror = () =>
  new AppError('Your token expire , please login again.!', 401);

const sendErrorDev = (err, req, res) => {
  // A. API Error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  console.log(`Error here 🔥: `, err);
  // B. Render website error
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message
  });
};

const sendErroPord = (err, req, res) => {
  // A. API error
  if (req.originalUrl.startsWith('/api')) {
    // Operational , trusted error : send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // Programming or other unknown error : don't leak error details
    // 1. log the error
    console.log(`Error here 🔥: `, err);
    // 2. Send generic message
    return res.status(500).json({
      status: 'error occured',
      message: 'Something went wrong'
    });
  }
  // B. REndered website
  // Operational , trusted error : send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
  // B. Programming or other unknown error : don't leak error details
  // 1. log the error
  console.log(`Error here 🔥: `, err);
  // 2. Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try agian later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  //   console.log('Error in : ', process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpirerror();

    sendErroPord(error, req, res);
  }
};
