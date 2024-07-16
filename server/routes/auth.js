import express from 'express';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import authController from '../controllers/authController.js';
import User from '../models/User.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        authController.registerUser(req, res);
    }
);

// @route   POST api/users/login
// @desc    Login user
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        authController.loginUser(req, res);
    }
);

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/users/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', (req, res, next) => {
    console.log("Google authentication initiated");
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET api/users/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/auth/google/callback',
    (req, res, next) => {
        console.log("Google callback invoked");
        next();
    },
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        console.log("Google authentication successful");
        // Successful authentication, redirect home.
        res.redirect('/'); // Change this to the desired route after successful login
    }
);

// @route   GET api/users/logout
// @desc    Logout user
// @access  Public
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

export default router;
