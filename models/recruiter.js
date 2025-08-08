const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const recruiterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  bio: String,
  location: { type: String, required: true },
  companysize: { type: Number, required: true },
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
});

// Hash password before saving
recruiterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
recruiterSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Recruiter", recruiterSchema);
