import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Container, Typography, Button, Box, Card, CardContent, CardActions } from '@mui/material';

const RogalListPage = () => {
    const [rogals, setRogals] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRogals = async () => {
            try {
                const res = await api.get('/rogals');
                const sortedRogals = res.data.sort((a, b) => a.name.localeCompare(b.name));
                setRogals(sortedRogals);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchRogals();
    }, []);

    const deleteRogal = async (id) => {
        try {
            await api.delete(`/rogals/${id}`);
            setRogals(rogals.filter((rogal) => rogal._id !== id));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                Wszystkie rogale
            </Typography>
            <Box sx={{ mt: 4 }}>
                {rogals.map((rogal) => (
                    <Card key={rogal._id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                <Link to={`/rogals/${rogal._id}`}>{rogal.name}</Link>
                            </Typography>
                            <Typography variant="body1">{rogal.description}</Typography>
                            <Typography variant="body1">Cena: {rogal.price} zł</Typography>
                            <Typography variant="body1">Waga: {rogal.weight} g</Typography>
                            <Typography variant="body1">Średnia ocena: {rogal.averageRating !== undefined ? rogal.averageRating.toFixed(1) : 'No ratings yet'}</Typography>
                            <Typography variant="body1">Stosunek jakości do ceny: {rogal.qualityToPriceRatio !== undefined ? rogal.qualityToPriceRatio.toFixed(2) : 'N/A'}</Typography>
                            <Typography variant="body1">Cena za 1kg: {rogal.pricePerKg !== undefined ? rogal.pricePerKg.toFixed(2) : 'N/A'} zł</Typography>
                            <Typography variant="body1">Liczba głosów: {rogal.ratings.length}</Typography>
                            {rogal.image && <img src={rogal.image} alt={rogal.name} />}
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="secondary" onClick={() => deleteRogal(rogal._id)}>Usuń</Button>
                            <Button size="small" color="primary" onClick={() => navigate(`/rogals/edit/${rogal._id}`)}>Edytuj</Button>
                        </CardActions>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default RogalListPage;
