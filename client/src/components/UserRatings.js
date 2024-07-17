import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

const UserRatings = () => {
    const [ratings, setRatings] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [newRating, setNewRating] = useState('');
    const [newComment, setNewComment] = useState('');
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
        setNewComment(rating.comment);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.put(`/rogals/rating/${selectedRating.rogalId}`, { rating: newRating, comment: newComment }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Rating updated successfully');
            setError('');
            setSelectedRating(null);
            setNewRating('');
            setNewComment('');
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
            setError('Failed to update rating');
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
                            secondary={`Rating: ${rating.rating !== null ? rating.rating : 'No rating'}, Comment: ${rating.comment !== null ? rating.comment : 'No comment'}`}
                        />
                    </ListItem>
                ))}
            </List>
            {selectedRating && (
                <form onSubmit={handleUpdate}>
                    <TextField
                        label="New Rating"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={newRating}
                        onChange={(e) => setNewRating(e.target.value)}
                        required
                    />
                    <TextField
                        label="New Comment"
                        fullWidth
                        margin="normal"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Update Rating
                    </Button>
                </form>
            )}
        </Container>
    );
};

export default UserRatings;
