const AppError = require('./../utils/appError');

const handelCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handelDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  // .log(value);
  const message = `Duplicate field value : ${value[0]}`;
  return new AppError(message, 400);
};

const handelValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const handelJWTError = () =>
  new AppError('Invalid Token. Please try again', 401);

const handelJWTExpiredToken = () =>
  new AppError('Your Token has expired. Please Log in again');

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: err,
      stack: err.stack,
    });
    //RENDER WEBSITE
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  console.log('ERROR🧨: ', err);
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    console.error('ERROR 🤦🏻: ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  } else {
    res.status(500).render('error', {
      title: 'Something went wrong',
      msg: 'Please Try again later!',
    });
  }
  console.log('ERROR🧨: ', err);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err }; // hard copy

  console.log('GLOBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL Error Handler');
  // console.log(err);
  if (err.name == 'CastError') err = handelCastErrorDB(err);
  if (err.code == '11000') err = handelDuplicateFieldsDB(err);
  if (err.name == 'ValidationError') err = handelValidationErrorDB(err);
  if (err.name == 'JsonWebTokenError') err = handelJWTError();
  if (err.name == 'TokenExpiredError') err = handelJWTExpiredToken();
  // sendErrorProd(err, req, res);
  sendErrorDev(err, req, res);

  // .log(err);
};
// if (err.isOperational) {
//   sendErrorDev(err, res);
// } else {}
