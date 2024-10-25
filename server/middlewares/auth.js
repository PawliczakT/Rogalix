import jwt from 'jsonwebtoken';
import { secretOrKey } from '../config/config.js';
import User from '../models/User.js';

const auth = async (req, res, next) => {
    console.log('Auth middleware - headers:', req.headers); // debugging

    const authHeader = req.header('Authorization');
    if (!authHeader) {
        console.log('No Authorization header found'); // debugging
        return res.status(401).json({
            error: 'Authorization header is missing',
            message: 'Brak nagłówka autoryzacji'
        });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        console.log('No token found in Authorization header'); // debugging
        return res.status(401).json({
            error: 'Token is missing',
            message: 'Brak tokenu autoryzacji'
        });
    }

    try {
        console.log('Verifying token'); // debugging
        const decoded = jwt.verify(token, secretOrKey);
        console.log('Decoded token:', decoded); // debugging

        const user = await User.findOne({ _id: decoded.id });
        console.log('Found user:', user ? user._id : 'none'); // debugging

        if (!user) {
            console.log('User not found for token'); // debugging
            return res.status(401).json({
                error: 'User not found',
                message: 'Użytkownik nie istnieje'
            });
        }

        // Check if token has expired
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTimestamp) {
            console.log('Token has expired'); // debugging
            return res.status(401).json({
                error: 'Token expired',
                message: 'Sesja wygasła, zaloguj się ponownie'
            });
        }

        req.token = token;
        req.user = user;
        console.log('Auth successful for user:', user._id); // debugging
        next();
    } catch (err) {
        console.error('Auth error:', {
            error: err.message,
            stack: err.stack,
            token: token ? token.substring(0, 10) + '...' : 'no token'
        }); // debugging

        let errorMessage = 'Błąd autoryzacji';
        if (err.name === 'JsonWebTokenError') {
            errorMessage = 'Nieprawidłowy token';
        } else if (err.name === 'TokenExpiredError') {
            errorMessage = 'Sesja wygasła, zaloguj się ponownie';
        }

        res.status(401).json({
            error: err.name,
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const adminAuth = async (req, res, next) => {
    console.log('Admin auth middleware - checking user:', req.user?._id); // debugging

    const authHeader = req.header('Authorization');
    if (!authHeader) {
        console.log('No Authorization header found in admin auth'); // debugging
        return res.status(401).json({
            error: 'Authorization header is missing',
            message: 'Brak nagłówka autoryzacji'
        });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        console.log('No token found in admin auth'); // debugging
        return res.status(401).json({
            error: 'Token is missing',
            message: 'Brak tokenu autoryzacji'
        });
    }

    try {
        console.log('Verifying admin token'); // debugging
        const decoded = jwt.verify(token, secretOrKey);
        console.log('Decoded admin token:', decoded); // debugging

        const user = await User.findOne({ _id: decoded.id });
        console.log('Found admin user:', user ? user._id : 'none'); // debugging

        if (!user) {
            console.log('User not found for admin token'); // debugging
            return res.status(401).json({
                error: 'User not found',
                message: 'Użytkownik nie istnieje'
            });
        }

        if (user.role !== 'admin') {
            console.log('User is not an admin:', user._id); // debugging
            return res.status(403).json({
                error: 'Not an admin',
                message: 'Brak uprawnień administratora'
            });
        }

        req.token = token;
        req.user = user;
        console.log('Admin auth successful for user:', user._id); // debugging
        next();
    } catch (err) {
        console.error('Admin auth error:', {
            error: err.message,
            stack: err.stack,
            token: token ? token.substring(0, 10) + '...' : 'no token'
        }); // debugging

        let errorMessage = 'Błąd autoryzacji';
        if (err.name === 'JsonWebTokenError') {
            errorMessage = 'Nieprawidłowy token';
        } else if (err.name === 'TokenExpiredError') {
            errorMessage = 'Sesja wygasła, zaloguj się ponownie';
        }

        res.status(401).json({
            error: err.name,
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Pomocnicza funkcja do walidacji tokenu
const validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, secretOrKey);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        return {
            isValid: decoded.exp > currentTimestamp,
            decoded
        };
    } catch (err) {
        return {
            isValid: false,
            error: err.message
        };
    }
};

export { auth, adminAuth, validateToken };
