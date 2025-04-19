import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Container, Typography } from '@mui/material';

const GoogleAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            navigate('/rogals');
        }
    }, [navigate]);

    return (
        <Container sx={{ mt: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
                Trwa logowanie przez Google...
            </Typography>
        </Container>
    );
};

export default GoogleAuth;
