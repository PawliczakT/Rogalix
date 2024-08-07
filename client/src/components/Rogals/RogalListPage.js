import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Container, Typography, Button, Box, Card, CardContent, CardActions, TextField } from '@mui/material';

const RogalListPage = () => {
    const [rogals, setRogals] = useState([]);
    const [averagePrice, setAveragePrice] = useState(0);
    const [averageWeight, setAverageWeight] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRogals = async () => {
            try {
                let isAdmin = false;
                try {
                    const userRes = await api.get('/users/me');
                    isAdmin = userRes.data.role === 'admin';
                } catch (error) {
                    console.error('User not logged in:', error);
                }
                setIsAdmin(isAdmin);

                const res = isAdmin ? await api.get('/rogals/admin') : await api.get('/rogals');
                const sortedRogals = res.data.sort((a, b) => a.name.localeCompare(b.name));
                setRogals(sortedRogals);

                const statsRes = await api.get('/rogals/statistics');
                setAveragePrice(statsRes.data.averagePrice);
                setAverageWeight(statsRes.data.averageWeight);
            } catch (err) {
                console.error(err.response?.data || err.message);
            }
        };

        fetchRogals();
    }, []);

    const deleteRogal = async (id) => {
        try {
            await api.delete(`/rogals/${id}`);
            setRogals(rogals.filter((rogal) => rogal._id !== id));
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    const approveRogal = async (id) => {
        try {
            await api.put(`/rogals/approve/${id}`);
            const updatedRogals = rogals.map((rogal) =>
                rogal._id === id ? { ...rogal, approved: true } : rogal
            );
            setRogals(updatedRogals);
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    const getArrow = (value, average) => {
        if (value > average) {
            return '↑';
        } else if (value < average) {
            return '↓';
        } else {
            return '→';
        }
    };

    const filteredRogals = rogals.filter(rogal =>
        rogal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rogal.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container>
            <p></p>
            <TextField
                label="Szukaj"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 4 }}
            />
            <Box sx={{ mt: 4 }}>
                {filteredRogals.map((rogal) => (
                    <Card key={rogal._id} sx={{ mb: 2 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="h2">
                                    <Link to={`/rogals/${rogal._id}`}>{rogal.name}</Link>
                                </Typography>
                                <Typography variant="body1">{rogal.description}</Typography>
                                <Typography variant="body1">
                                    Cena: {rogal.price} zł {getArrow(rogal.price, averagePrice)}
                                </Typography>
                                <Typography variant="body1">
                                    Waga: {rogal.weight} g {getArrow(rogal.weight, averageWeight)}
                                </Typography>
                                <Typography variant="body1">Średnia ocena: {rogal.averageRating !== undefined ? rogal.averageRating.toFixed(1) : 'No ratings yet'}</Typography>
                                <Typography variant="body1">Stosunek jakości do ceny: {rogal.qualityToPriceRatio !== undefined ? rogal.qualityToPriceRatio.toFixed(2) : 'N/A'}</Typography>
                                <Typography variant="body1">Cena za 1kg: {rogal.pricePerKg !== undefined ? rogal.pricePerKg.toFixed(2) : 'N/A'} zł</Typography>
                                <Typography variant="body1">Liczba głosów: {rogal.ratings.length}</Typography>
                            </Box>
                            {rogal.image && (
                                <Box sx={{ ml: 2 }}>
                                    <img
                                        src={rogal.image}
                                        alt={rogal.name}
                                        style={{ height: '150px', width: '300px', objectFit: 'cover' }}
                                    />
                                </Box>
                            )}
                        </CardContent>
                        <CardActions>
                            {isAdmin && (
                                <>
                                    <Button size="small" color="primary" onClick={() => approveRogal(rogal._id)} disabled={rogal.approved}>Zatwierdź</Button>
                                    <Button size="small" color="secondary" onClick={() => deleteRogal(rogal._id)}>Usuń</Button>
                                    <Button size="small" color="primary" onClick={() => navigate(`/rogals/edit/${rogal._id}`)}>Edytuj</Button>
                                </>
                            )}
                        </CardActions>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default RogalListPage;
