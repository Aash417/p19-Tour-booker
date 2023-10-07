const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const monogoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// 1) Global MIDDLEWARES

// set security http header
app.use(helmet());
// app.use(
//   cors({
//     origin: 'http://localhost:8000',
//     credentials: true
//   })
// );

// app.use(helmet());
// // app.use(
// //   helmet.contentSecurityPolicy({
// //     directives: {
// //       defaultSrc: ["'self'", 'data:', 'blob:'],

// //       baseUri: ["'self'"],

// //       fontSrc: ["'self'", 'https:', 'data:'],

// //       scriptSrc: ["'self'", 'https://*.cloudflare.com'],

// //       //   scriptSrc: ["'self'", 'https://*.stripe.com'],

// //       //   scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],

// //       frameSrc: ["'self'", 'https://*.stripe.com'],

// //       objectSrc: ["'none'"],

// //       styleSrc: ["'self'", 'https:', 'unsafe-inline'],

// //       workerSrc: ["'self'", 'data:', 'blob:'],

// //       childSrc: ["'self'", 'blob:'],

// //       imgSrc: ["'self'", 'data:', 'blob:'],

// //       connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],

// //       upgradeInsecureRequests: []
// //     }
// //   })
// // );
// //after
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'unpkg.com'],
//       styleSrc: ["'self'", 'cdnjs.cloudflare.com']
//       // fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
//     }
//   })
// );

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against nosql query injection
app.use(monogoSanitize());

// Data sanitization against xss
app.use(xss());

// Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //   console.log('cookie: ', req.cookies);
  next();
});

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  //   const err = new Error(`Cant find ${req.originalUrl} on this server`);
  //   err.status = 'failllllll';
  //   err.statusCode = 404;

  next(new AppError(`Cant find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
