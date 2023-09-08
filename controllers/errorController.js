const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.status
  });
};

const sendErroPord = (err, res) => {
  // Operational , trusted error : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  //   Programming or other unknown error : don't leak error details
  else {
    // 1. log the error
    console.error(err);
    // 2. Send generic message
    res.status(500).json({
      status: 'error occured',
      message: 'some error occured'
    });
  }
};

module.exports = (err, req, res, next) => {
  //   console.log('error : ', err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErroPord(err, res);
  }
};
