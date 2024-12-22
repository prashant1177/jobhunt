const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    exp: { type: String, required: true },
    salary: { type: String, required: true },
    skills: [String], // Array of skills
    createdAt: {
        type: String, // Store as a string in the desired format
        default: () => {
            const date = new Date();
            return date.toLocaleString('en-US', {
                month: 'short', // e.g., Dec
                day: '2-digit', // e.g., 21
                year: 'numeric', // e.g., 2024
            });
        }
    }
});

module.exports = mongoose.model('Job', jobSchema);
