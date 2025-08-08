const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "jobSeeker", required: true },
  skills: [String],

  education: {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    yearOfPassing: { type: Number, min: 1900, max: new Date().getFullYear() },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  experience: [
    {
      company: { type: String, required: true },
      jobrole: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date }, // optional for current job
      description: String,
    },
  ],
  projects: {
    type: [
      {
        title: { type: String, required: true },
        description: String,
        techStack: [String],
        link: String,
      },
    ],
  },
  bio: String,
  location: String,
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
});

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
studentSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Student", studentSchema);
