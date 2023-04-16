const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.objectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.objectId,
    ref: 'User',
    required: [true, 'A booking must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'A booking must belong to a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, (next) => {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
});

const Booking = mongoose.Model('Booking', bookingSchema);

module.exports = Booking;
