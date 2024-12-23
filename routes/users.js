const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role, profile } = req.body;
        const user = new User({ name, email, password, role, profile });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login route
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })
);

// Logout route
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

module.exports = router;
