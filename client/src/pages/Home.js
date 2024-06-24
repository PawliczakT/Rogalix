import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Typography, Box } from '@mui/material';

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
                setStats(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchStats();
    }, []);

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                {isLoggedIn ? (
                    <>Witaj {userName}, dodaj lub oceń se rogala:)</>
                ) : (
                    <>Witaj na stronie do oceny Rogali Świętomarcińskich, zaloguj się aby móc dodawać rogale i oceny.</>
                )}
            </Typography>
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
        </Container>
    );
};

export default Home;
