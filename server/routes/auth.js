import express from 'express';
import {check, validationResult} from 'express-validator';
import authController from '../controllers/authController.js';
import User from '../models/User.js';
import {auth} from '../middlewares/auth.js';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {secretOrKey} from '../config/config.js';

const router = express.Router();

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('confirmEmail', 'Please include a valid email').isEmail()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        if (req.body.email !== req.body.confirmEmail) {
            return res.status(400).json({msg: 'Emails do not match'});
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
            return res.status(400).json({errors: errors.array()});
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

// @route   PUT api/users/password
// @desc    Update user password
// @access  Private
router.put(
    '/password',
    [
        auth,
        [
            check('currentPassword', 'Current password is required').exists(),
            check('newPassword', 'Please enter a new password with 6 or more characters').isLength({min: 6})
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {currentPassword, newPassword} = req.body;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(400).json({msg: 'User not found'});
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({msg: 'Incorrect current password'});
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            res.json({msg: 'Password updated successfully'});
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// --- Google OAuth ---
// Główne trasy
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get(
    '/google/callback',
    passport.authenticate('google', {session: false, failureRedirect: process.env.FRONTEND_URL + '/login?google=fail'}),
    (req, res) => {
        const payload = {id: req.user.id};
        const token = jwt.sign(payload, secretOrKey, {expiresIn: 3600});
        res.redirect(`${process.env.FRONTEND_URL}/google-auth?token=${token}`);
    }
);
// Alias dla /auth/google i /auth/google/callback (historycznie spotykane)
router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get(
    '/auth/google/callback',
    passport.authenticate('google', {session: false, failureRedirect: process.env.FRONTEND_URL + '/login?google=fail'}),
    (req, res) => {
        const payload = {id: req.user.id};
        const token = jwt.sign(payload, secretOrKey, {expiresIn: 3600});
        res.redirect(`${process.env.FRONTEND_URL}/google-auth?token=${token}`);
    }
);

export default router;
