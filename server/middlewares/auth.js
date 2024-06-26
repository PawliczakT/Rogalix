import jwt from 'jsonwebtoken';
import { secretOrKey } from '../config/config.js';
import User from '../models/User.js';

const auth = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).send({ error: 'Authorization header is missing' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, secretOrKey);
        const user = await User.findOne({ _id: decoded.id });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

const adminAuth = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).send({ error: 'Authorization header is missing' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, secretOrKey);
        const user = await User.findOne({ _id: decoded.id });

        if (!user || user.role !== 'admin') {
            return res.status(403).send({ error: 'Access denied. Admins only.' });
        }

        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

export { auth, adminAuth };
