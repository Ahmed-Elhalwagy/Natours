const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
exports.getOverview = catchAsync(async (req, res) => {
  //1) Getting Tour Data
  const tours = await Tour.find();
  // console.log(tours);
  //2) Building the template

  // console.log(tours);
  //3) Render that templeate using the data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour', { tour });
});

exports.getLogin = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log in into your account',
  });
});

exports.signup = catchAsync(async (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).render('user', {
    title: 'Your Account',
  });
});

//UPDATING USING THE FORM ACTION NOT API
// exports.updateUserData = catchAsync(async (req, res, next) => {
//   // console.log('Updated User Data: ', req.body);
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res.status(200).render('user', {
//     title: 'Your Account',
//     user: updatedUser,
//   });
// });
