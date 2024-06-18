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
    });

    useEffect(() => {
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
                Witaj na stronie, na której możesz ocenić Rogale Świętomarcińskie:)
            </Typography>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Garść statystyk:
                </Typography>
                <Typography variant="body1">Ilość ocenianych rogali: {stats.totalRogals}</Typography>
                <Typography variant="body1">Ilość ocen: {stats.totalRatings}</Typography>
                <Typography variant="body1">Średnia ocena: {stats.averageRating.toFixed(2)}</Typography>
                <Typography variant="body1">Najwyższa ocena: {stats.highestRating.toFixed(2)}</Typography>
                <Typography variant="body1">Najlepszy rogal: {stats.bestRogal}</Typography>
                <Typography variant="body1">Najniższa ocena: {stats.lowestRating.toFixed(2)}</Typography>
                <Typography variant="body1">Najgorszy rogal: {stats.worstRogal}</Typography>
            </Box>
        </Container>
    );
};

export default Home;
