const mongoose = require('mongoose');

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
    maxlength: 12,
  },
});

module.exports = mongoose.model('User', UserSchema);
