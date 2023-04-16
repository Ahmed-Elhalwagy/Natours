const express = require('express');
//requring the route handlers
const tourController = require('./../Controllers/tourController');
const authController = require('./../Controllers/authController');
const reviewController = require('./../Controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const tourRouter = express.Router();

//mouting the nested route
tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
//explanation for the upper route we will run the aliasTopTours middleware first then the getAllTours

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlane
  );

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'), //these are the roles that allowed to eun the deleteTour action. This function will run and retrun the middleware function itself
    tourController.deleteTour
  );

module.exports = tourRouter;

/////////////////////////////////////////////////////////////////////////////////////////////////////
//A middleware for (Tour) params only.
// tourRouter.param('id', tourController.checkId);

//

// nested router
// tourRouter
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
