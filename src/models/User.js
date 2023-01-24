const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide a name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'please provide an email'],
    match: [
      // here we can check if email matches regex
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      // throw an error with this message
      'please provide a valid email',
    ],
    // "unique" IS NOT A VALIDATOR!
    // It is a convenient helper for building MongoDB unique indexes.
    // A unique index ensures that the indexed fields do not store duplicate values;
    // i.e. enforces uniqueness for the indexed fields.
    // By default, MongoDB creates a unique index on the _id field
    // during the creation of a collection. So in our case we make sure that
    // documents created in MongoDB will have an "email" field that will be checked
    // for duplicates every time we create/update documents
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 6,
  },
});

// To extract and move password hashing from controllers (in order to not repeat ourselves),
// we can go with "PRE" HOOK that can be used on any Mongoose Schema.
// This hook is basically a middleware that accepts 2 arguments:
// 1) query method (in our case we use "save" that saves the document by inserting
// a new document into the database);
// 2) callback function that is executed BEFORE execution of query method (so we can put some useful
// logic here e.g. password hashing)
// eslint-disable-next-line prefer-arrow-callback
UserSchema.pre('save', async function () {
  // In order to solve the problem of NON-ENCODED passwords we need to hash the password (which is
  // one-way operation i.e. it cannot be reversed) or in other words to ENCODE it such
  // that as a result "password" field of the document in MongoDB will hold some gibberish.
  // "salt" is random data that is used as an additional input to a one-way function
  // that hashes data, a password or passphrase.
  // To create salt we use "genSalt" method that accepts "number of rounds" which is basically
  // telling this method how much random data we want to add to the hashed password
  const salt = await bcrypt.genSalt(10);
  // to create hashed password(which is safe to store in DB) we use "hash" method (notice that
  // we use "this.password" because it will have the plain text password value from the request)
  // and store it in "this.password" of the UserSchema:
  this.password = await bcrypt.hash(this.password, salt);
  // IMPORTANT! In order go to the next middleware in chain, and effectively finish creating
  // new document in MongoDB by now we have 2 options:
  // - we pass "next" to callback function AND call it explicitly (i.e. next())
  // - we don't pass "next" to callback at all AND it will be called implicitly anyway
});

// we can add methods to Schema instances by adding properties to "methods" field
// By the way we use function expression with "function" keyword and not an arrow function
// because we want "this" pointer to point at the Schema instance, and as we know
// we CANNOT USE ARROW FUNCTIONS AS AN OBJECT METHOD!!! And in our case "methods" is AN OBJECT!
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    // eslint-disable-next-line no-underscore-dangle
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    },
  );
};

// here we add one more instance method that will compare newly provided and hashed
// one with the stored one (which is of course also hashed):
UserSchema.methods.comparePasswords = async function (providedPassword) {
  const isMatch = await bcrypt.compare(providedPassword, this.password);

  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
