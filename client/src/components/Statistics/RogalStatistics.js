import React, {useEffect, useState} from 'react';
import {useYear} from '../../context/YearContext';
import api from '../../api';
import {Box, Container, Grid, Paper, Typography} from '@mui/material';
import RogalCharts from './RogalCharts';
import AdvancedRogalCharts from './AdvancedRogalCharts';

const RogalStatistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const {year: selectedYear} = useYear();
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/rogals/statistics', {params: {year: selectedYear}});
                setStats(res.data);
            } catch (err) {
                setError('Błąd podczas pobierania statystyk');
            } finally {
                setLoading(false);
            }
        };
        if (selectedYear) fetchStats();
    }, [selectedYear]);

    if (loading) return <Typography>Ładowanie statystyk...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!stats) return null;

    return (
        <Container>
            <Box sx={{mt: 4}}>
                <Typography variant="h4" gutterBottom>Statystyki rogali</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{p: 2}}>
                            <Typography variant="subtitle1">Liczba rogali</Typography>
                            <Typography variant="h6">{stats.totalRogals}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{p: 2}}>
                            <Typography variant="subtitle1">Liczba ocen</Typography>
                            <Typography variant="h6">{stats.totalRatings}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{p: 2}}>
                            <Typography variant="subtitle1">Średnia ocena</Typography>
                            <Typography variant="h6">{stats.averageRating.toFixed(2)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{p: 2}}>
                            <Typography variant="subtitle1">Średnia cena</Typography>
                            <Typography variant="h6">{stats.averagePrice.toFixed(2)} zł</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{p: 2}}>
                            <Typography variant="subtitle1">Średnia waga</Typography>
                            <Typography variant="h6">{stats.averageWeight.toFixed(0)} g</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{p: 2}}>
                            <Typography variant="subtitle1">Najlepszy rogal</Typography>
                            <Typography variant="h6">{stats.bestRogal || '-'}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{p: 2}}>
                            <Typography variant="subtitle1">Najgorszy rogal</Typography>
                            <Typography variant="h6">{stats.worstRogal || '-'}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
            <RogalCharts/>
            <AdvancedRogalCharts/>
        </Container>
    );
};

export default RogalStatistics;
