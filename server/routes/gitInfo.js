import express from 'express';
import git from 'git-rev-sync';

const router = express.Router();

// @route   GET /api/git-info
// @desc    Get the current branch and commit hash
// @access  Public
router.get('/', (req, res) => {
    try {
        const branch = git.branch();
        const commitHash = git.long();
        res.json({ branch, commitHash });
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve git information' });
    }
});

export default router;
