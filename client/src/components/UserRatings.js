import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

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
        setNewRating(rating.rating);
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
            {error && <Typography color="error">{error}</Typography>}
            {message && <Typography color="primary">{message}</Typography>}
            <List>
                {ratings.map(rating => (
                    <ListItem key={rating.rogalId} button onClick={() => handleEdit(rating)}>
                        <ListItemText
                            primary={`Rogal: ${rating.rogalName}`}
                            secondary={`Ocena: ${rating.rating !== 'Brak oceny' ? rating.rating : 'Brak oceny'}`}
                        />
                    </ListItem>
                ))}
            </List>
            {selectedRating && (
                <form onSubmit={handleUpdate}>
                    <TextField
                        label="Nowa ocena (1-6)"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={newRating}
                        onChange={(e) => setNewRating(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Zaktualizuj ocenę
                    </Button>
                </form>
            )}
        </Container>
    );
};

export default UserRatings;
