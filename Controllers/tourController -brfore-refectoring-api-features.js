// const fs = require('fs');
// Offline Data
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    //1)Filtering
    let queryObj = { ...this.queryString };
    excludedFields = ['page', 'sort', 'limit', 'fields']; // we don't want this propertyes to be in our query because we will use them later
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(queryObj);

    // 2)Advanced Filtering for (gt gte lt lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // to add th $ to gte lte .....
    // console.log(JSON.parse(queryStr));
  }
}

exports.getAllTours = async (req, res) => {
  //we can filter by 2 ways 1. filter object 2.mongoose methods
  try {
    //BUILD QUERY
    // //1)Filtering
    let queryObj = { ...req.query };
    excludedFields = ['page', 'sort', 'limit', 'fields']; // we don't want this propertyes to be in our query because we will use them later
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(queryObj);

    // 2)Advanced Filtering for (gt gte lt lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // to add th $ to gte lte .....
    // console.log(JSON.parse(queryStr));

    // 2.mongoose special methods in filteration
    // const query = Tour.find()
    //   .where('duration')
    //   .gte(5)
    //   .where('difficulty')
    //   .equals('easy');

    //  {difficulty : 'easy', duration : { $gte:  5} we want it to be like that to work with monogo
    //  {difficulty : 'easy' ,duration: { gte: '5' } it comes like that (?difficulty=easy&duration[gte]=5)

    let query = Tour.find(JSON.parse(queryStr));

    //3)Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // default sort value
    }

    //4)Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); // not sending the __v
    }

    //5) Pagination
    // page=2&limit=10 --> the user wants page number 2 with 10 results in page --> 1:10 in page 1 , 11:20 in page 2
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100; // 100 is the default value they all will be in the first page try make it 3 and see the difference
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit); // we skip the first (skip) results and show the next (limit) elements

    if (req.query.page) {
      const numberTours = await Tour.countDocuments(); // will retrun a promise that has the number of docs
      if (skip >= numberTours) throw new Error("This page doesn't exist"); // to enter the catch block
    }
    //EXECUTE QUERY
    tours = await query;

    // 2.mongoose special methods in filteration
    // const query = Tour.find()
    //   .where('duration')
    //   .gte(5)
    //   .where('difficulty')
    //   .equals('easy');

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
      runValidators: true,
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
