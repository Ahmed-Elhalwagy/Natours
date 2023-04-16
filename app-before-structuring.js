const express = require('express');
const fs = require('fs');
const { get } = require('http');
const morgan = require('morgan');
const { allowedNodeEnvironmentFlags } = require('process');

const PORT = 3000;
const app = express();

// Offline Data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple - Copy.json`)
);

//middlewares
app.use(morgan('dev'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.json()); // use -> add a middleware to our middleware stack

//route handlers --> Controllers
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: {
      tours: tours,
    },
  });
};

const getTour = (req, res) => {
  if (req.params.id > tours.length) {
    res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
    const tour = tours.find((el) => el.id == req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        tours: tour,
      },
    });
  }
};

const CreateTour = (req, res) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find((el) => el.id == req.params.tourId);

  res.status(200).json({
    status: 'success',
    data: {
      tours: '<Updated tour>',
    },
  });
};

const deleteTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find((el) => el.id == req.params.tourId);

  console.log('ddd');
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined',
  });
};

const CreateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined',
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', CreateTour);

// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3) Routes

// we create a new router for Tours
// how will we connect this router with app -> we will use is as middleware
// when request hits the url the tourRouter(subapplication) middelware eill run

app.use('/api/v1/tours', TourRouter);
app.use('/api/v1/users', userRouter);

const TourRouter = express.Router();
const userRouter = express.Router();

TourRouter.route('/').get(getAllTours).post(CreateTour);
TourRouter.route('/:id').get(getTour).post(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(CreateUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
///////////////////////////////////////////////////////////////////
// OLD ROUTES BAD PRACTICE -> WE solve it using mounting👆🏻
// app.route('/api/v1/tours').get(getAllTours).post(CreateTour);
// app.route('/api/v1/tours/:id').get(getTour).post(updateTour).delete(deleteTour);

// app.route('/api/v1/users').get(getAllUsers).post(CreateUser);
// app
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

//4) Server start
app.listen(PORT, () => console.log('Listening on port 3000: '));
