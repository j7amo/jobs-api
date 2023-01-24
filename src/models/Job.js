const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide company's name"],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, 'Please provide position'],
      maxlength: 100,
    },
    status: {
      type: String,
      // we limit the values for "status" field
      enum: ['interview', 'declined', 'pending'],
      default: 'pending',
    },
    // here we would like to point to the User who created the job (to use this data
    // to query the jobs related only to the current user)
    createdBy: {
      // to associate a job(when we create it) with a User we need to:
      // - set "type" field to be the ID used by MongoDB when document is created;
      // - set a "ref" field to be the name of the model we want to reference.
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  {
    timestamps: true, // this adds "createdAt" and "updatedAt fields added to document
  },
);

module.exports = mongoose.model('Job', JobSchema);
