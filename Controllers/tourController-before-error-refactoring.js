// const fs = require('fs');
// Offline Data
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const APIFeatures = require(`${__dirname}/../utils/APIFeatures.js`);

const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //EXECUTE QUERY
    //                              Query object  Query string
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'sucess',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
    console.log(err);
  }
};

exports.getTour = async (req, res) => {
  // console.log(req.params);
  try {
    // const tour = await Tour.findOne({ name: req.params.id });
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

exports.CreateTour = async (req, res) => {
  try {
    // first way
    // const newTour = await new Tour(req.body);
    // await newTour.save();

    // second way
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // to run data calidators again
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

//Aggregation (It has a weird syntax) it is used to get statistics
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
    console.log(err);
  }
};

exports.getMonthlyPlane = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
    console.log(err);
  }
};

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
