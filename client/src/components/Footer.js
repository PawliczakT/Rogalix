import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';

const Footer = () => {
    const [gitInfo, setGitInfo] = useState({ branch: '', commitHash: '' });

    useEffect(() => {
        const fetchGitInfo = async () => {
            try {
                const response = await axios.get('/api/git-info');
                setGitInfo(response.data);
            } catch (err) {
                console.error('Failed to fetch git info:', err);
            }
        };

        fetchGitInfo();
    }, []);

    return (
        <Container>
            <Typography variant="body2" color="textSecondary" align="center">
                Branch: {gitInfo.branch} | Commit: {gitInfo.commitHash}
            </Typography>
        </Container>
    );
};

export default Footer;
