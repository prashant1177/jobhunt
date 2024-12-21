const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['jobSeeker', 'employer'], default: 'jobSeeker' },
    profile: {
        skills: [String],
        company: String,
        bio: String,
        location: String,
    },
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
