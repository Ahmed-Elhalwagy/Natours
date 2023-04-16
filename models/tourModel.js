const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator'); // VALIDATORS MODULE TO USE

const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    // schema defination
    name: {
      type: String, // type
      required: [true, 'A Tour must have a name'], // required, err message
      unique: true, // no duplicated
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contains charachters'],
    },
    slug: String,
    duration: {
      type: String,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: String,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 , 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a price'], // required, err message
    },
    priceDiscount: {
      type: Number,
      validate: {
        // val -> priceDiscount
        validator: function (val) {
          //this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Price discount ({VALUE}) should be below the price',
      },
    },
    summary: {
      type: String,
      trim: true, // to remove white space in the begining and end only for strings
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // to not display it
    },
    startDates: [Date], // array of dates
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //Geospial Data -> to specifay it we need to have at least type and coordinates
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // modeling tour guides embedded
    guides: [
      {
        type: mongoose.Schema.ObjectId, // special data type
        ref: 'User', // The Refrence
      },
    ],
  },
  // schema options object
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 }); //asscenind order fore performance
tourSchema.index({ slug: 1 });

//vitual properties are fields that we can define on our schema
//but that won't be persisted won't be saved in DB
//It makes a lot of sense for fields that can be derived from one to another km -> mile
//It is a calculation so it isn't in out DB
//we add get method because this virtual peoperty will be created each time we GET
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // this -> document
});

// // Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // in the review model we have a field called tour that includes the ID
  localField: '_id',
});

// Mongoose (hooks) middlewares (pre, post) (document,query,aggregate,model)

//QUERY MIDDLEWARE
// a hook to show only the none secret tours
// a regular expression all querys starts with find word
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } }); // this -> query
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  next();
});

//Population tour guides
tourSchema.pre(/^find/, function (next) {
  this.populate({
    // where will you populate the data --> path
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// for modeling tour guides embedded
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//Document MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  next();
});

//AGGREGATION MIDDLEWARE
// a hook to show only the none secret tours
tourSchema.pre('aggregate', function (next) {
  // console.log(this.pipeline);
  //add to the begining of the array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
//The first argument is the singular name of the👆🏻
// collection your model is for. Mongoose automatically looks for the plural, lowercased version of your model name.
module.exports = Tour;
