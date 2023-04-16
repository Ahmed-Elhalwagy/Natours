// const fs = require('fs');
// Offline Data
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const APIFeatures = require(`${__dirname}/../utils/APIFeatures.js`);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

//to allow only images to be uploaded
const multerFilret = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not An image please upload an image', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilret });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// upload.single('photo');
// upload.array('images', 3);

exports.resizeTourImages = catchAsync(async (req, file, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  //1) cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) // 3:2 ratio
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2) other images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const imageFilename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333) // 3:2 ratio
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageFilename}`);

      req.body.images.push(imageFilename);
    })
  );
  next();
});

exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//Aggregation (It has a weird syntax) it is used to get statistics
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // match it like a filter object
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    // group documents together to take the avg min max ..etc
    {
      $group: {
        // _id: { $toUpper: '$difficulty' },
        _id: '$difficulty',
        // _id: '$price',
        // _id: null, //null -> chosing all the tours
        numTours: { $sum: 1 }, // add one for each document to calculate the number of docs
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 }, // 1->ascending  -1->descending
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlane = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // to get 1 document for each date in the array of dates
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addField: { month: '$id' } },
    { $sort: { numToursStart: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
//////////////////////////////////////////////////////////

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //EXECUTE QUERY
//   //                              Query object  Query string
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   res.status(200).json({
//     status: 'sucess',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // console.log(req.params);

//   // const tour = await Tour.findOne({ name: req.params.id });
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new AppError('Error tour Not Found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.getTour = async (req, res, next) => {
//   // console.log(req.params);
//   try {
//     // const tour = await Tour.findOne({ name: req.params.id });
//     const tour = await Tour.findById(req.params.id);

//     if (!tour) {
//       return next(new AppError('Erro tour Not Found', 404));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'Fail',
//       err: err,
//     });
//   }
// };

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch((err) => next(err));
//   };
// };

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true, // to run data calidators again
//   });

//   if (!tour) {
//     return next(new AppError('Errقo tour Not Found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('Erro tour Not Found', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

/////////////////////////////////////////////////////////

// for offline data

// exports.checkBody = (req, res, next) => {
//   console.log(req.body);
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'Fail',
//       message: 'Missing name or price ',
//     });
//   }
//   next();
// };

// exports.checkId = (req, res, next, val) => {
//   console.log(`Tour ID is ${val}`);
//   if (req.params.id > tours.length) {
//     return res.status(404).json({
//       status: 'Fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// exports.getAllTours = (req, res) => {
//   console.log(req.requestTime);
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     requestedAt: req.requestTime,
//     data: {
//       tours: tours,
//     },
//   });
// };

// exports.getTour = (req, res) => {
//   const tour = tours.find((el) => el.id == req.params.id);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tours: tour,
//     },
//   });
// };

// exports.CreateTour = (req, res) => {
//   // console.log(req.body);
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           newTour,
//         },
//       });
//     }
//   );
// };

// exports.updateTour = (req, res) => {
//   const tourId = req.params.id * 1;
//   const tour = tours.find((el) => el.id == req.params.tourId);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours: '<Updated tour>',
//     },
//   });
// };

// exports.deleteTour = (req, res) => {
//   const tourId = req.params.id * 1;
//   const tour = tours.find((el) => el.id == req.params.tourId);

//   console.log('ddd');
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };
