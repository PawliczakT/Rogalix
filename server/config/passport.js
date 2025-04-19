import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';
import { secretOrKey } from './config.js';

const User = mongoose.model('users');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretOrKey;

export default function(passport) {
    // JWT strategy
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            User.findById(jwt_payload.id)
                .then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    return done(null, false);
                })
                .catch(err => console.log(err));
        })
    );

    // Google OAuth strategy
    passport.use(
        new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    return done(null, user);
                } else {
                    // If user with this email exists, link Google account
                    user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        user.googleId = profile.id;
                        await user.save();
                        return done(null, user);
                    }
                    // New user
                    const newUser = new User({
                        name: profile.displayName || profile.emails[0].value,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        password: undefined,
                    });
                    await newUser.save();
                    return done(null, newUser);
                }
            } catch (err) {
                return done(err, null);
            }
        })
    );
}

