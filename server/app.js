import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import path from 'path';
import {fileURLToPath} from 'url';
import {mongoURI as db} from './config/config.js';
import users from './routes/auth.js';
import rogals from './routes/rogals.js';
import gustometr from './routes/gustometr.js';
import passportConfig from './config/passport.js';
import simpleGit from 'simple-git';

dotenv.config();
const git = simpleGit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use(passport.initialize());

passportConfig(passport);

app.use('/api/users', users);
app.use('/api/rogals', rogals);
app.use('/api/gustometr', gustometr);

app.get('/api/git-info', async (req, res) => {
    try {
        const branchSummary = await git.branchLocal();
        const currentBranch = branchSummary.current;
        const commitSummary = await git.log({n: 1});
        const latestCommitHash = commitSummary.latest.hash;

        res.json({
            branch: currentBranch,
            commit: latestCommitHash,
        });
    } catch (err) {
        console.error('Failed to get Git info', err);
        res.status(500).json({error: 'Failed to get Git info'});
    }
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

export default app;