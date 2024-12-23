const express = require('express');
const { ensureAuthenticated, ensureEmployer } = require('../middleware/auth');
const Job = require('../models/job');
const router = express.Router();

// Create job route (employers only)
router.post('/jobs', ensureAuthenticated, ensureEmployer, async (req, res) => {
    try {
        const { title, company, location, description, skills } = req.body;

        const job = new Job({
            title,
            company,
            location,
            description,
            skills,
            createdBy: req.user._id
        });

        await job.save();

        req.user.jobsPosted.push(job._id);
        await req.user.save();

        res.status(201).send('Job created successfully');
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
