const { StatusCodes } = require('http-status-codes');
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
  const user = await User.create({ ...req.body });
  res.status(StatusCodes.CREATED).json(user);
};

const loginUser = async (req, res) => {
  res.send('login user');
};

module.exports = {
  registerUser,
  loginUser,
};
