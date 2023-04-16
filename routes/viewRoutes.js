const express = require('express');

const viewController = require('../Controllers/viewsController');
const authController = require('../Controllers/authController');

const viewRouter = express.Router();

viewRouter.get(
  '/overview',
  authController.isLoggedIn,
  viewController.getOverview
);

viewRouter.get(
  '/tours/:tourSlug',
  authController.isLoggedIn,
  viewController.getTour
);

viewRouter.get('/login', authController.isLoggedIn, viewController.getLogin);

viewRouter.get('/signup', authController.isLoggedIn, viewController.signup);

viewRouter.get('/me', authController.protect, viewController.getMe);

//update user data using the form action without needing an API
// viewRouter.post(
//   '/submit-user-data',
//   authController.protect,
//   viewController.updateUserData
// );
module.exports = viewRouter;
