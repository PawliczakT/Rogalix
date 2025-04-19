import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../../api';
import {Button, Container, TextField, Typography} from '@mui/material';
import GoogleLoginButton from './GoogleLoginButton';
import {useNotification} from '../../context/NotificationContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const {showNotification} = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/users/login', {email, password});
            localStorage.setItem('token', res.data.token);
            showNotification('Zalogowano pomyślnie!', 'success');
            window.location.href = '/rogals';
        } catch (err) {
            setError(err.response.data.msg);
            showNotification(err.response?.data?.msg || 'Błąd logowania', 'error');
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
            <GoogleLoginButton/>
        </Container>
    );
};

export default Login;
