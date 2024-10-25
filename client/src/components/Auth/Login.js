import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
    Container, TextField, Button, Typography, Box, Alert, Paper
} from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Najpierw spróbuj się zalogować
            const loginResponse = await api.post('/users/login', { email, password });
            const token = loginResponse.data.token;

            if (!token) {
                throw new Error('No token received');
            }

            // Zapisz token
            localStorage.setItem('token', token);

            // Ustaw token w headers
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Zweryfikuj token natychmiast po zalogowaniu
            try {
                await api.get('/users/me');
                console.log('Token verification successful');
                navigate('/rogals');
            } catch (verifyError) {
                console.error('Token verification failed:', verifyError);
                throw new Error('Token verification failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.msg || 'Błąd logowania');
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    return (
        <Container>
            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    label="Hasło"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Zaloguj się
                </Button>
            </form>
        </Container>
    );
};

export default Login;
