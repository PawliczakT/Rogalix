import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Typography, Box, Grid } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Home = () => {
    const [stats, setStats] = useState({
        totalRogals: 0,
        totalRatings: 0,
        averageRating: 0,
        highestRating: 0,
        bestRogal: null,
        lowestRating: 0,
        worstRogal: null,
        averagePrice: 0,
        averageWeight: 0,
    });

    const [priceRatingData, setPriceRatingData] = useState([]);
    const [userName, setUserName] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            const fetchUser = async () => {
                try {
                    const res = await api.get('/users/me');
                    setUserName(res.data.name);
                } catch (err) {
                    console.error(err.response.data);
                }
            };
            fetchUser();
        }

        const fetchStats = async () => {
            try {
                const res = await api.get('/rogals/statistics');
                console.log('Fetched stats:', res.data); // Log the fetched stats
                setStats(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        const fetchPriceRatingData = async () => {
            try {
                const res = await api.get('/rogals');
                const data = res.data.map(rogal => ({
                    name: rogal.name,
                    price: parseFloat(rogal.price),
                    averageRating: rogal.ratings.length > 0
                        ? rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0) / rogal.ratings.length
                        : 0
                }));
                setPriceRatingData(data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchStats();
        fetchPriceRatingData();
    }, []);

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                {isLoggedIn ? (
                    <>Witaj {userName}, dodaj lub oceń se rogala:)</>
                ) : (
                    <>Witaj na stronie do oceny Rogali Świętomarcińskich, zaloguj się aby móc dodawać rogale i oceny.</>
                )}
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Garść statystyk:
                        </Typography>
                        <Typography variant="body1">Ilość ocenianych rogali: {stats.totalRogals}</Typography>
                        <Typography variant="body1">Ilość ocen: {stats.totalRatings}</Typography>
                        <Typography variant="body1">Średnia ocena: {stats.averageRating !== undefined ? stats.averageRating.toFixed(2) : 'N/A'}</Typography>
                        <Typography variant="body1">Najwyższa ocena: {stats.highestRating !== undefined ? stats.highestRating.toFixed(2) : 'N/A'}</Typography>
                        <Typography variant="body1">Najlepszy rogal: {stats.bestRogal || 'N/A'}</Typography>
                        <Typography variant="body1">Najniższa ocena: {stats.lowestRating !== undefined ? stats.lowestRating.toFixed(2) : 'N/A'}</Typography>
                        <Typography variant="body1">Najgorszy rogal: {stats.worstRogal || 'N/A'}</Typography>
                        <Typography variant="body1">Średnia cena rogala: {stats.averagePrice !== undefined ? stats.averagePrice.toFixed(2) : 'N/A'} zł</Typography>
                        <Typography variant="body1">Średnia waga rogala: {stats.averageWeight !== undefined ? stats.averageWeight.toFixed(2) : 'N/A'} g</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={priceRatingData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="price" stroke="#8884d8" name="cena" />
                            <Line type="monotone" dataKey="averageRating" stroke="#82ca9d" name="średnia ocena" />
                        </LineChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
