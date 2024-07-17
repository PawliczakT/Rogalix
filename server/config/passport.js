import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { secretOrKey } from './config.js';

const configurePassport = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, async (token, tokenSecret, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    user.googleId = profile.id; // Link Google account to existing user
                    user.tokens = user.tokens.concat({ token });
                } else {
                    const payload = {
                        id: profile.id,
                    };

                    const token = jwt.sign(
                        payload,
                        secretOrKey,
                        { expiresIn: 3600 }
                    );

                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        tokens: [{ token }]
                    });
                }
                await user.save();
            } else {
                const payload = {
                    id: user.id,
                };

                const token = jwt.sign(
                    payload,
                    secretOrKey,
                    { expiresIn: 3600 }
                );

                user.tokens.push({ token });
                await user.save();
            }

            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }));
};

export default configurePassport;
