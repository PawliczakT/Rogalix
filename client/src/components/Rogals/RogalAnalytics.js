import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
    Container, Typography, Box, Card, CardContent,
    Tabs, Tab, CircularProgress, Grid, Alert, Button
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';

const RogalAnalytics = () => {
    const navigate = useNavigate();
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                console.log('Fetching analytics from:', `${api.defaults.baseURL}/rogals/analytics`); // debugging

                const response = await api.get('/rogals/analytics');
                console.log('Analytics response:', response.data);

                setAnalysisData(response.data);
            } catch (err) {
                console.error('Analytics error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError(err.response?.data?.message || 'Błąd podczas ładowania analiz');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [navigate]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleRefresh = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        window.location.reload();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress/>
                <Typography variant="body2" sx={{ml: 2}}>
                    Ładowanie analiz...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleRefresh}
                        >
                            Odśwież
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    const QualityTab = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Analiza Jakości Rogali
                </Typography>
                {analysisData?.qualityMetrics ? (
                    <Grid container spacing={2}>
                        {analysisData.qualityMetrics.map((metric, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {metric.name}
                                        </Typography>
                                        <Typography variant="h4">
                                            {metric.value}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {metric.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography color="textSecondary">
                        Brak danych o jakości
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    const TrendsTab = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Trendy w Ocenach
                </Typography>
                {analysisData?.trends ? (
                    <Grid container spacing={2}>
                        {analysisData.trends.map((trend, index) => (
                            <Grid item xs={12} key={index}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {trend.period}
                                        </Typography>
                                        <Typography variant="body1">
                                            {trend.description}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            color={parseFloat(trend.change) > 0 ? "success.main" : "error.main"}
                                        >
                                            {trend.change}%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography color="textSecondary">
                        Brak danych o trendach
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    const PreferencesTab = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Analiza Preferencji
                </Typography>
                {analysisData?.preferences ? (
                    <Grid container spacing={2}>
                        {analysisData.preferences.map((pref, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {pref.category}
                                        </Typography>
                                        <Typography variant="body1">
                                            {pref.insight}
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            {pref.popularity}%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography color="textSecondary">
                        Brak danych o preferencjach
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Container>
            <Box sx={{mt: 4}}>
                <Typography variant="h4" gutterBottom>
                    Analiza Rogali
                </Typography>

                <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="analytics tabs"
                    >
                        <Tab
                            icon={<AnalyticsIcon/>}
                            label="Jakość"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<TrendingUpIcon/>}
                            label="Trendy"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<PeopleIcon/>}
                            label="Preferencje"
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                <Box sx={{mt: 2}}>
                    {tabValue === 0 && <QualityTab/>}
                    {tabValue === 1 && <TrendsTab/>}
                    {tabValue === 2 && <PreferencesTab/>}
                </Box>

                <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end'}}>
                    <Button
                        variant="outlined"
                        onClick={handleRefresh}
                        startIcon={<TrendingUpIcon/>}
                    >
                        Odśwież dane
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default RogalAnalytics;
