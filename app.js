const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Global MIDDLEWARES

// set security http header
app.use(helmet());

// development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit req from api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this IP, please try again in an hour.'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb'
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //   console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  //   const err = new Error(`Cant find ${req.originalUrl} on this server`);
  //   err.status = 'failllllll';
  //   err.statusCode = 404;

  next(new AppError(`Cant find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
