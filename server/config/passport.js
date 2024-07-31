import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt';
import {secretOrKey} from './config.js';
import User from '../models/User.js'; // Ensure the User model is imported

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretOrKey;

export default function (passport) {
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
}
