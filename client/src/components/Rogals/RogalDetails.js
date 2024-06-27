import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Container, Typography, Box, Card, CardContent, TextField, Button, Alert } from '@mui/material';

const RogalDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rogal, setRogal] = useState({});
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRogal = async () => {
            try {
                const res = await api.get(`/rogals/${id}`);
                setRogal(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchRogal();
    }, [id]);

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.put(`/rogals/rating/${id}`, { rating, comment });
            const res = await api.get(`/rogals/${id}`);
            setRogal(res.data);
            setRating('');
            setComment('');
            setError(null);
        } catch (err) {
            setError(err.response.data.msg);
        }
    };

    const onDelete = async () => {
        try {
            await api.delete(`/rogals/${id}`);
            navigate('/rogals');
        } catch (err) {
            setError(err.response.data.msg);
        }
    };

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {rogal.name}
                        </Typography>
                        <Typography variant="body1">{rogal.description}</Typography>
                        <Typography variant="body1">Cena: {rogal.price}</Typography>
                        <Typography variant="body1">Waga: {rogal.weight}</Typography>
                        <Typography variant="body1">
                            Średnia ocena: {rogal.averageRating !== undefined ? rogal.averageRating.toFixed(1) : 'No ratings yet'}
                        </Typography>
                        <Typography variant="body1">
                            Stosunek jakości do ceny: {rogal.qualityToPriceRatio !== undefined ? rogal.qualityToPriceRatio.toFixed(2) : 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                            Cena za 1kg: {rogal.pricePerKg !== undefined ? rogal.pricePerKg.toFixed(2) : 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                            Liczba głosów: {rogal.ratings ? rogal.ratings.length : 'No votes yet'}
                        </Typography>
                        {rogal.image && <img src={`http://localhost:5000/${rogal.image}`} alt={rogal.name} style={{ maxWidth: '100%' }} />}
                    </CardContent>
                </Card>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Dodaj ocenę
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <form onSubmit={onSubmit}>
                        <TextField
                            type="number"
                            label="Ocena"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            placeholder="Rating"
                            inputProps={{ min: "1", max: "6", step: "0.5" }}
                            fullWidth
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Komentarz"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Comment"
                            multiline
                            rows={4}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <Button variant="contained" color="primary" type="submit">
                            Dodaj ocenę
                        </Button>
                    </form>
                </Box>
            </Box>
        </Container>
    );
};

export default RogalDetails;
