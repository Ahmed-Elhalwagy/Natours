const { findByIdAndUpdate } = require('../models/tourModel');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // cb --> next but it isn't coming from express
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //from req.file
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date().now}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

//to allow only images to be uploaded
const multerFilret = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not An image please upload an image', 400), false);
  }
};

// const upload = multer({ dest: 'public/img/users' });
const upload = multer({ storage: multerStorage, fileFilter: multerFilret });

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.uploadUserPhoto = upload.single('photo'); // the field that will contain the image to upload

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date().now}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log('FILE', req.file);
  // console.log('BODY', req.body);

  // 1) Make sure that user can't update password field
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. plesae use /updateMyPassword',
        400
      )
    );
  }
  // 2) filtered out unwanted fields names like role ..etc
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename; // if updating the image
  // 3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined use /signup insted',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
