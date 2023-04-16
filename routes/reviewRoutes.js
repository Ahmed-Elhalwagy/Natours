const express = require('express');
//requring the route handlers
const reviewController = require('./../Controllers/reviewController');
const authController = require('./../Controllers/authController');

const reviewRouter = express.Router({ mergeParams: true }); // Important in the mounting routes with params

// Protect all the middlewares(routes) that come after this middleware 👇🏻
reviewRouter.use(authController.protect);

//POST /tours/234fad/reviews

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

reviewRouter
  .route('/:id')
  .get(reviewController.getOneReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = reviewRouter;
