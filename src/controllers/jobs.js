const { StatusCodes } = require('http-status-codes');
const Job = require('../models/Job');
const { BadRequestError, NotFoundError } = require('../errors/index');

const getAllJobs = async (req, res) => {
  // when querying for the jobs we want to filter them by "createdBy" value
  // that should be the current(the one who made request) user's ID.
  const jobs = await Job.find({ createdBy: req.user.userId }).sort('createdAt');
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
  // do some nested destructuring...
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  // we query for a Job by filter not only with "_id" but also with "createdBy"
  // so that we can prevent access to the jos that is not associated with current user:
  const job = await Job.findOne({ _id: jobId, createdBy: userId });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId} found`);
  }

  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  const { company, position } = req.body;

  if (!company || !position) {
    throw new BadRequestError('Please provide company and position');
  }

  // because Job schema has "createdBy" field that should be MongoDB's id of the document
  // AND it is required then we have to provide it too. By default, we don't have it on "req.body"
  // so we just ADD IT(we take the value from "userId" property of "req.user" which was first added
  // when we issued JWT, then it was decoded and added to "req.user" during authentication step):
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);

  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (!company || !position) {
    throw new BadRequestError('Please provide company and position');
  }

  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    { company, position },
    { new: true, runValidators: true },
  );

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId} found`);
  }

  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOneAndRemove({ _id: jobId, createdBy: userId });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId} found`);
  }

  res.status(StatusCodes.OK).send();
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
