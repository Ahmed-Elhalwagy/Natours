const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimiting = require('express-rate-limit');
const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoutes.js');
const bookingRouter = require('./routes/bookingRoutes.js');
const viewRouter = require('./routes/viewRoutes.js');

const AppError = require(`${__dirname}/utils/appError.js`);
const globalErrorHnadler = require(`${__dirname}/Controllers/errorController.js`);

//Start express App
const app = express();
app.enable('trust proxy');

// Setting The view Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const limiter = rateLimiting({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 5 requests per `window` (here, per 10 minutes)
  message: 'To Many requestes form this IP, please try again in an hour',
});

//GLOBAL middlewares
app.use(core());
//Access-Control-Allo-Origin (hrader)

app.options('*', cors()); // options is an http method (we do that to pervent the preflight phase)

//set security HTTP HEADERS
app.use(helmet());

if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// limit requests on the API (Bruet Force attack)
app.use('/api', limiter);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // paresr data from a form
app.use(cookieParser()); // Parses data from the cookie

// Data sanitization against No SQL QUERY injection -> login without knowing the email ("email": {$gt: ""})
app.use(mongoSantize());
// Data sanitization against XSS
app.use(xss());
// Prevent Paramenter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuatity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
// serving static files
app.use(express.static(`${__dirname}/public`)); // middleware to sevrve static files

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(compression());

//test Middleware
app.use((req, res, next) => {
  // console.log('your COOKIES: ', req.cookies);
  next();
});

//3) Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// handling unhandled routes -> all the routes, all the URLs , all the methods
app.all('*', (req, res, next) => {
  //BEFORE GLOBAL ERROR HANDLING MIDDLEWAREX
  // res.status(404).json({
  //   status: 'Fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  //BEFORE APPERROR CLASS
  // const error = new Error(`Can't find ${req.originalUrl} on this server`);
  // error.status = 'Fail';
  // error.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));

  //whenever we add argument to next express will know
  //automatically that it is an error and skip the other middlewares
  //and send the error to the global error handling middleware
});

//GLOBAL ERROR HANDLING MIDDLEWARE
//4 prameters express recognize that it is a error handler middleware
app.use(globalErrorHnadler);

module.exports = app;
