const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
// for "Register User" flow we want to:
// 1) Validate data with "Mongoose"
// 2) Hash password with "bcrypt.js"
// 3) issue token
// 4) send response with token
const registerUser = async (req, res) => {
  // we can check for empty values ourselves
  // const { name, email, password } = req.body;
  // if (!name || !email || !password) {
  //   throw new BadRequestError('Please provide name, email and password');
  // }

  // OR if we don't want to check for the empty/incorrect values ourselves
  // then Mongoose will use its built-in validators that we set up in Schema.
  // Here's one BIG PROBLEM: if we just pass "req.body" to "User.create" as it is,
  // then the password that we extracted from the user request will be
  // STORED AS A NON-ENCODED STRING. Which means that if someone breaks into our DB,
  // then user passwords are basically already stolen.
  // const user = await User.create(req.body);

  // So in order to solve this problem we need to hash the password (which is
  // one-way operation i.e. it cannot be reversed) or in other words to ENCODE it such
  // that as a result "password" field of the document in MongoDB will hold some gibberish.
  const { name, email, password } = req.body;
  // "salt" is random data that is used as an additional input to a one-way function
  // that hashes data, a password or passphrase.
  // To create salt we use "genSalt" method that accepts "number of rounds" which is basically
  // telling this method how much random data we want to add to the hashed password
  const salt = await bcrypt.genSalt(10);
  // to create hashed password(which is safe to store in DB) we use "hash" method:
  const hashedPassword = await bcrypt.hash(password, salt);

  // then we create updated user that holds hashed password instead of human-readable one
  const updatedUser = {
    name,
    email,
    password: hashedPassword,
  };

  const user = await User.create({ ...updatedUser });
  res.status(StatusCodes.CREATED).json(user);
};

const loginUser = async (req, res) => {
  res.send('login user');
};

module.exports = {
  registerUser,
  loginUser,
};
