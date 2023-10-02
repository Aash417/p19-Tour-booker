const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  // 1. Get tour data from collection
  const tours = await Tour.find();

  // 2. Build template

  // 3. Render template using tour data from 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. get the data for the requested tour including the tour & guide
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  // 2. build the template
  console.log(tour);
  // 3. Render template the using the data

  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.1/axios.min.js 'unsafe-inline' 'unsafe-eval';"
    )
    .render('login', {
      title: 'Log into your account'
    });
});
