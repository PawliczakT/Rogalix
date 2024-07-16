import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { mongoURI as db } from './config/config.js';
import users from './routes/auth.js';
import rogals from './routes/rogals.js';
import gustometr from './routes/gustometr.js';
import { configurePassport } from './config/passport.js';
import auth from "./routes/auth.js"; // Correct import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
configurePassport(passport);

// Use Routes
app.use('/api/users', users);
app.use('/api/rogals', rogals);
app.use('/api/gustometr', gustometr);
app.use('/api', auth);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));

export default app;
