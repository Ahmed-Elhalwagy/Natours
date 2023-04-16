const mongoose = require('mongoose');
const validator = require('validator'); // VALIDATORS MODULE TO USE
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//name , email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a valid name'],
  },
  email: {
    type: String,
    required: [true, 'A user should have an Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid Email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user should have a Password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm youe password'],
    select: false,
    validate: {
      //THIS ONLY work on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'The Two passwords should be the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Because sometimes the JWT is created before the saving in the DB so we put a 1 sec in the past as a safe factor
  next();
});

// query middleware
userSchema.pre(/^find/, function (next) {
  //points to the current find query
  this.find({ active: { $ne: false } });
  next();
});

/////METHODS
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(changeTimestamp, JWTTimestamp);
    return JWTTimestamp < changeTimestamp;
  }
  //false means Not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // the token

  this.passwordResetToken = crypto // encrypting the token
    .createHash('sha256')
    .update(resetToken) // that is waht we want to encrypt
    .digest('hex');

  // console.log('Reset Token: ', { resetToken });
  // console.log('Password Reset Token: ', this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // the reset token expieres after 10 mins

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
