import React, {useEffect, useState} from 'react';
import api from '../../api';
import {Box, Button, Card, CardContent, Container, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';

const RogalRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // Pobierz wszystkie rogale i oceny użytkownika
                const [rogalsRes, myRatingsRes] = await Promise.all([
                    api.get('/rogals'),
                    api.get('/rogals/my-ratings'),
                ]);
                const rogals = rogalsRes.data;
                const myRatings = myRatingsRes.data;
                const ratedIds = myRatings.filter(r => r.rating !== 'Brak oceny').map(r => r.rogalId);

                // Polecaj rogale, które użytkownik jeszcze nie oceniał, sortując po najwyższej średniej ocenie
                const recommendations = rogals
                    .filter(r => !ratedIds.includes(r._id))
                    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                    .slice(0, 5);
                setRecommendations(recommendations);
            } catch (err) {
                setError('Błąd podczas pobierania rekomendacji');
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading) return <Typography>Ładowanie rekomendacji...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container>
            <Box sx={{mt: 4}}>
                <Typography variant="h4" gutterBottom>Rekomendacje rogali dla Ciebie</Typography>
                {recommendations.length === 0 ? (
                    <Typography>Nie znaleziono nowych rogali do polecenia. Oceniaj więcej rogali, by uzyskać lepsze
                        rekomendacje!</Typography>
                ) : (
                    recommendations.map(rogal => (
                        <Card key={rogal._id} sx={{mb: 2}}>
                            <CardContent>
                                <Typography variant="h6">{rogal.name}</Typography>
                                <Typography variant="body2">{rogal.description}</Typography>
                                <Typography variant="body2">Średnia
                                    ocena: {rogal.averageRating ? rogal.averageRating.toFixed(2) : 'Brak ocen'}</Typography>
                                <Button sx={{mt: 1}} variant="outlined"
                                        onClick={() => navigate(`/rogals/${rogal._id}`)}>Zobacz szczegóły</Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </Container>
    );
};

export default RogalRecommendations;
