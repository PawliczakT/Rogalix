import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Container, TextField, Button, Typography } from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/users/login', { email, password });
            localStorage.setItem('token', res.data.token);
            window.location.href = '/rogals';
            // window.location.reload();
        } catch (err) {
            setError(err.response.data.msg);
        }
    };

    return (
        <Container>

            {error && <Typography color="error">{error}</Typography>}
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
                <Button type="submit" variant="contained" color="primary">
                    Zaloguj się
                </Button>
            </form>
        </Container>
    );
};

export default Login;
