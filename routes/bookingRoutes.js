const express = require('express');
//requring the route handlers
const bookingController = require('./../Controllers/bookingController');
const authController = require('./../Controllers/authController');

const bookingRouter = express.Router();

bookingRouter.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = bookingRouter;
