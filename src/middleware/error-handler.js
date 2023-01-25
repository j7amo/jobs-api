const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  // Besides our own errors that we throw explicitly there are also errors
  // thrown by MongoDB:
  // 1) Validation errors
  // 2) Duplicate errors
  // 3) Cast errors
  // If we want to make errors thrown by MongoDB more human-readable(by default
  // we are getting back the big clunky objects), we need to translate them
  // to a more simplified versions based on the error code (these are internal MongoDB codes)
  // We can start with creating a template for a custom error and will mutate it
  // based on what data we have in the error object thrown by MongoDB:
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong.Try again later',
  };

  // effectively we don't need this anymore
  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message });
  // }

  // MongoDB Validation error
  if (err.name && err.name === 'ValidationError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
  }

  // MongoDB Duplicates error
  if (err.code && err.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue,
    )} field, please choose another value`;
  }

  // MongoDB Cast error
  if (err.name && err.name === 'CastError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = `No item found with id ${err.value}`;
  }

  return res.status(customError.statusCode).json({ msg: customError.message });
};

module.exports = errorHandlerMiddleware;
