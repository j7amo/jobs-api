const registerUser = async (req, res) => {
  res.send('register user');
};

const loginUser = async (req, res) => {
  res.send('login user');
};

module.exports = {
  registerUser,
  loginUser,
};
