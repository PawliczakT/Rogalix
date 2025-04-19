import React from 'react';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const GOOGLE_AUTH_URL = (process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '/api/users/google')
    : 'http://localhost:5000/api/users/google') +
    '?prompt=select_account+consent&access_type=offline';

const GoogleLoginButton = () => (
    <Button
        variant="outlined"
        color="primary"
        startIcon={<GoogleIcon />}
        href={GOOGLE_AUTH_URL}
        sx={{ mt: 2, mb: 2 }}
        fullWidth
    >
        Zaloguj się przez Google
    </Button>
);

export default GoogleLoginButton;
