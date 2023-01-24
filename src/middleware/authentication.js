const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors/index');

// here we define authentication middleware that will check for token
// before user is accessing the protected resources
const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    // if provided token is OK then we'll have decoded value (the one that we encode
    // when we issue the JWT - { userId: this._id, name: this.name },
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // we attach the decoded value to the "req" object for future use in controller
    req.user = {
      userId: decoded.userId,
      name: decoded.name,
    };
    next();
  } catch (err) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

module.exports = authenticationMiddleware;
