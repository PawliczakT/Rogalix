import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {secretOrKey} from '../config/config.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const registerUser = async (req, res) => {
    const {name, email} = req.body;

    try {
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({msg: 'User already exists'});
        }

        const password = crypto.randomBytes(8).toString('hex');

        user = new User({
            name,
            email,
            password,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const payload = {
            id: user.id,
        };

        const token = jwt.sign(
            payload,
            secretOrKey,
            {expiresIn: 3600}
        );

        user.tokens = user.tokens.concat({token});
        await user.save();

        // Send email with the generated password
        const mailOptions = {
            to: email,
            subject: 'Twoje hasło do Rogalix.pl',
            text: `Witaj ${name},\n\nTwoje konto na www.rogalix.pl zostało stworzone. Oto Twoje hasło: ${password}\n\nMożesz je zmienić po zalogowaniu się.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.json({token});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        let user = await User.findOne({email});

        if (!user) {
            return res.status(400).json({msg: 'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({msg: 'Invalid credentials'});
        }

        const payload = {
            id: user.id,
        };

        const token = jwt.sign(
            payload,
            secretOrKey,
            {expiresIn: 3600}
        );

        user.tokens = user.tokens.concat({token});
        await user.save();

        res.json({token});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export default {
    registerUser,
    loginUser,
};
