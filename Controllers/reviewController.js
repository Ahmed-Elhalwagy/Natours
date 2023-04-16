const Review = require('./../models/reviewModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const sendJSON = (res, statusCode, review) => {
  res.status(statusCode).json({
    status: 'success',
    data: {
      review,
    },
  });
};

exports.getOneReview = factory.getOne(Review);

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

//////////////////////////////////////////////////////////////////////////////////

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);

//   res.status(201).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// exports.getOneReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);

//   if (!review) {
//     return next(new AppError('Error review Not Found', 404));
//   }

//   sendJSON(res, 201, review);
// });

// exports.createReview = catchAsync(async (req, res, next) => {
// //Allow nested routes
// if (!req.body.tour) req.body.tour = req.params.tourId;
// if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   sendJSON(res, 201, newReview);
// });
