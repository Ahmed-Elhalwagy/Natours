const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/overview`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: ['https://natours.netlify.app/img/nat-9.jpg'],
          },
        },
      },
    ],
  });

  //3) Create session and send it
  res.status(200).json({
    status: 'success',
    session,
  });
});
