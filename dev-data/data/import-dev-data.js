const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: `${__dirname}/../../config.env` });

const Tour = require(`${__dirname}/../../models/tourModel`);
const User = require(`${__dirname}/../../models/userModel`);
const Review = require(`${__dirname}/../../models/reviewModel`);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', true);
mongoose
  .connect(DB, {
    useNewURLParser: true,
  })
  .then((con) => {
    console.log('DB connection successful');
  });
// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// console.log(tours); // array

// import data in the db
const importData = async () => {
  try {
    // await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);

    console.log('Data Successufuly Upoloded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all data from collection
const deleteData = async () => {
  try {
    // await Tour.deleteMany();
    await User.deleteMany();
    // await Review.deleteMany();

    console.log('Data Successufuly deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
// console.log(process.argv);
