import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Typography, List, ListItem, ListItemText, Box, TextField, Button, Alert } from '@mui/material';

const UserRatings = () => {
    const [ratings, setRatings] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [newRating, setNewRating] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/rogals/my-ratings', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log('Fetched ratings:', res.data);
                setRatings(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch ratings');
            }
        };

        fetchRatings();
    }, []);

    const handleEdit = (rating) => {
        setSelectedRating(rating);
        setNewRating(rating.rating !== 'No rating' ? rating.rating : '');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.put(`/rogals/rating/${selectedRating.rogalId}`, { rating: newRating }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Ocena zaktualizowana pomyślnie');
            setError('');
            setSelectedRating(null);
            setNewRating('');
            // Refresh ratings
            const res = await api.get('/rogals/my-ratings', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Refreshed ratings:', res.data);
            setRatings(res.data);
        } catch (err) {
            console.error(err);
            setError('Nie udało się zaktualizować oceny');
            setMessage('');
        }
    };

    return (
        <Container>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <List>
                {ratings.map((rating) => (
                    <ListItem key={rating.rogalId} button onClick={() => handleEdit(rating)}>
                        <ListItemText
                            primary={`Rogal: ${rating.rogalName}`}
                            secondary={`Ocena: ${rating.rating !== 'Brak oceny' ? rating.rating : 'Brak oceny'}`}
                        />
                    </ListItem>
                ))}
            </List>
            {selectedRating && (
                <Box component="form" onSubmit={handleUpdate}>
                    <TextField
                        label="Nowa Ocena (1-6)"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={newRating}
                        onChange={(e) => setNewRating(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Zaktualizuj Ocenę
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default UserRatings;
