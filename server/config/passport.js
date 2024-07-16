import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { secretOrKey } from './config.js';

export function configurePassport(passport) {
    passport.serializeUser((user, done) => {
        console.log('Serializing user:', user._id);
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            console.log('Deserializing user with id:', id);
            const user = await User.findById(id);
            if (user) {
                console.log('Deserialized user:', user._id);
                done(null, user);
            } else {
                console.log('No user found with id:', id);
                done(null, null);
            }
        } catch (err) {
            console.error('Error deserializing user:', err);
            done(err, null);
        }
    });

    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('Google profile:', profile);
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        // You might want to add a googleId field to your User model
                        // googleId: profile.id
                    });
                }

                // Generate JWT token
                const payload = { id: user._id, name: user.name, email: user.email };
                const token = jwt.sign(payload, secretOrKey, { expiresIn: '1d' });

                // Add token to user object
                user.tokens.push({ token });
                await user.save();

                console.log('Authenticated user:', user._id);
                return done(null, user);
            } catch (err) {
                console.error('Error in Google Strategy:', err);
                return done(err, false, { message: 'Internal Server Error' });
            }
        }));
}