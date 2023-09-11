const catchAsync = require('./../utils/catchAsync');

exports.login = catchAsync((req, res, next) => {
  const { email, password } = req.body;

  //   1. check if email and password exists
});
