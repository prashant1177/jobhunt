const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  location: String,
  salary: String,
  exp: String,
  skills: [String],
  createdAt: { type: Date, default: Date.now },
  applications: [
    {
      jobSeekerId: mongoose.Schema.Types.ObjectId,
      name: String,
      email: String,
      resume: String, // Optional link or text
      additionalDetails: String, // Optional notes
    },
  ],
});

module.exports = mongoose.model("Job", jobSchema);
