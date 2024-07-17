import React, { useState } from 'react';
import api from '../api';
import { Container, TextField, Button, Typography } from '@mui/material';

const UserAccount = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.put('/users/password', { currentPassword, newPassword }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Hasło pomyślnie zaktualizowane');
            setError('');
        } catch (err) {
            setError(err.response.data.msg || 'Wystąpił błąd. Spróbuj ponownie.');
            setMessage('');
        }
    };

    return (
        <Container>
            {error && <Typography color="error">{error}</Typography>}
            {message && <Typography color="primary">{message}</Typography>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Obecne Hasło"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="off"
                />
                <TextField
                    label="Nowe Hasło"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="off"
                />
                <Button type="submit" variant="contained" color="primary">
                    Zakutalizuj Hasło
                </Button>
            </form>
        </Container>
    );
};

export default UserAccount;
