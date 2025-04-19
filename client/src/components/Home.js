import React, { useEffect, useState } from 'react';
import { useYear } from '../context/YearContext';
import api from '../api';
import { Container, Typography, Box, Grid, Paper, Card, CardContent } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Home = () => {
    const { year: selectedYear } = useYear();
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
    const [priceWeightData, setPriceWeightData] = useState([]);
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
                    console.error(err.response ? err.response.data : err.message);
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
                console.error(err.response ? err.response.data : err.message);
            }
        };

        const fetchPriceRatingData = async () => {
            try {
                const res = await api.get('/rogals');
                const data = res.data.map(rogal => ({
                    name: rogal.name,
                    price: parseFloat(rogal.price),
                    weight: parseFloat(rogal.weight) / 10, // Convert weight to decagrams
                    averageRating: rogal.ratings.length > 0
                        ? rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0) / rogal.ratings.length
                        : 0
                }));
                setPriceRatingData(data);
                const priceWeightData = data.map(rogal => ({
                    name: rogal.name,
                    price: parseFloat(rogal.price),
                    weight: parseFloat(rogal.weight)
                }));
                setPriceWeightData(priceWeightData);
            } catch (err) {
                console.error(err.response ? err.response.data : err.message);
            }
        };

        fetchStats();
        fetchPriceRatingData();
    }, []);


    // Fetch data for selected year
    useEffect(() => {
        const fetchDataForYear = async () => {
            try {
                const res = await api.get('/rogals', { params: { year: selectedYear } });
                const data = res.data.map(rogal => ({
                    name: rogal.name,
                    price: parseFloat(rogal.price),
                    weight: parseFloat(rogal.weight) / 10, // Convert weight to decagrams
                    averageRating: rogal.ratings.length > 0
                        ? rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0) / rogal.ratings.length
                        : 0,
                    ratings: rogal.ratings
                }));
                setPriceRatingData(data);
                const priceWeightData = data.map(rogal => ({
                    name: rogal.name,
                    price: parseFloat(rogal.price),
                    weight: parseFloat(rogal.weight)
                }));
                setPriceWeightData(priceWeightData);

                // Calculate stats
                let totalRogals = data.length;
                let totalRatings = 0;
                let totalRatingSum = 0;
                let highestRating = 0;
                let lowestRating = 6;
                let bestRogal = null;
                let worstRogal = null;
                let bestRogalAvg = 0;
                let worstRogalAvg = 6;
                let totalPrice = 0;
                let totalWeight = 0;

                data.forEach(rogal => {
                    const ratings = rogal.ratings;
                    const numRatings = ratings.length;
                    if (numRatings > 0) {
                        const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / numRatings;
                        totalRatings += numRatings;
                        totalRatingSum += ratings.reduce((sum, r) => sum + r.rating, 0);
                        totalPrice += rogal.price;
                        totalWeight += rogal.weight;
                        if (avg > bestRogalAvg) {
                            bestRogalAvg = avg;
                            bestRogal = rogal.name;
                        }
                        if (avg < worstRogalAvg) {
                            worstRogalAvg = avg;
                            worstRogal = rogal.name;
                        }
                        ratings.forEach(r => {
                            if (r.rating > highestRating) highestRating = r.rating;
                            if (r.rating < lowestRating) lowestRating = r.rating;
                        });
                    }
                });

                setStats({
                    totalRogals,
                    totalRatings,
                    averageRating: totalRatings > 0 ? totalRatingSum / totalRatings : 0,
                    highestRating: totalRatings > 0 ? highestRating : 0,
                    bestRogal,
                    lowestRating: totalRatings > 0 ? lowestRating : 0,
                    worstRogal,
                    averagePrice: totalRogals > 0 ? totalPrice / totalRogals : 0,
                    averageWeight: totalRogals > 0 ? totalWeight / totalRogals : 0,
                });
            } catch (err) {
                setPriceRatingData([]);
                setPriceWeightData([]);
                setStats({
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
            }
        };
        if (selectedYear) {
            fetchDataForYear();
        }
    }, [selectedYear]);


    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                {isLoggedIn ? (
                    <>Witaj {userName}, dodaj lub oceń se rogala:)</>
                ) : (
                    <>Witaj na stronie do oceny Rogali Świętomarcińskich, zaloguj się aby móc dodawać rogale i oceny.</>
                )}
            </Typography>
            <Box sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ padding: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Garść statystyk:
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Ilość ocenianych rogali: {stats.totalRogals}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Ilość ocen: {stats.totalRatings}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Średnia ocena: {stats.averageRating !== undefined ? stats.averageRating.toFixed(2) : 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Najwyższa ocena: {stats.highestRating !== undefined ? stats.highestRating.toFixed(2) : 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Najlepszy rogal: {stats.bestRogal || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Najniższa ocena: {stats.lowestRating !== undefined ? stats.lowestRating.toFixed(2) : 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Najgorszy rogal: {stats.worstRogal || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Średnia cena rogala: {stats.averagePrice !== undefined ? stats.averagePrice.toFixed(2) : 'N/A'} zł</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1">Średnia waga rogala: {stats.averageWeight !== undefined ? (stats.averageWeight / 10).toFixed(2) : 'N/A'} dag</Typography> {/* Convert to decagrams */}
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
            <Grid container spacing={4} sx={{ mt: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="h3" gutterBottom>
                                Cena i Średnia Ocena
                            </Typography>
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
                                    <Line type="monotone" dataKey="averageRating" stroke="violet" name="średnia ocena" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="h3" gutterBottom>
                                Cena i Waga
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart
                                    data={priceWeightData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="price" stroke="#8884d8" name="cena" />
                                    <Line type="monotone" dataKey="weight" stroke="#82ca9d" name="waga (dag)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
