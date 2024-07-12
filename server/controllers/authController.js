import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { secretOrKey } from '../config/config.js';

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

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
            { expiresIn: 3600 }
        );

        user.tokens = user.tokens.concat({ token });
        await user.save();

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            id: user.id,
        };

        const token = jwt.sign(
            payload,
            secretOrKey,
            { expiresIn: 3600 }
        );

        user.tokens = user.tokens.concat({ token });
        await user.save();

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export default {
    registerUser,
    loginUser,
};
