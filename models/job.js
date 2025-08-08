const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  skills: { type: [String], required: true },
  exp: { type: String, required: true },
  salary: { type: String, required: true },
  postedBy: { type: Schema.Types.ObjectId, ref: "Recruiter", required: true }, // Reference to the User model
});

module.exports = mongoose.model("Job", JobSchema);
