import React, { useEffect, useState } from 'react';
import { useYear } from '../context/YearContext';
import api from '../api';
import { Box, Button, Card, CardContent, Container, Grid, Paper, Typography, Avatar, Divider, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import RogalIcon from '../assets/rogal.png';
import ProgressTracking from './ProgressTracking';
import ProgressDonut from './ProgressDonut';
import BakeriesMap from './BakeriesMap';

const HomeModern = () => {
  const { year: selectedYear } = useYear();
  const [totalRogals, setTotalRogals] = useState(0);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const fetchUser = async () => {
        try {
          const res = await api.get('/users/me');
          setUserName(res.data.name);
        } catch (err) {
          setUserName('');
        }
      };
      fetchUser();
    }
  }, []);

  useEffect(() => {
    // Pobierz liczbę rogali z danego roku (tak jak ProgressTracking)
    const fetchRogalsCount = async () => {
      try {
        const rogalsRes = await api.get('/rogals', { params: { year: selectedYear } });
        setTotalRogals(rogalsRes.data.length);
      } catch (err) {
        setTotalRogals(0);
      }
    };
    fetchRogalsCount();

    // Statystyki (średnia ocena, najlepszy rogal itp.)
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/rogals/statistics', { params: { year: selectedYear } });
        setStats(res.data);
      } catch (err) {
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
      } finally {
        setLoading(false);
      }
    };
    if (selectedYear) fetchStats();
  }, [selectedYear]);

  return (
    <Box sx={{ background: '#e3f0fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden', p: 0 }}>
          <Grid container>
            {/* Sidebar */}
            <Grid item xs={12} md={3} sx={{ background: '#fff', p: 4, minHeight: 500 }}>
              <Box textAlign="center">
                <Avatar src={RogalIcon} sx={{ width: 90, height: 90, mx: 'auto', mb: 2, border: '3px solid #90caf9' }} />
                <Typography variant="h6" fontWeight={700}>{userName || 'Gość'}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{isLoggedIn ? 'Zalogowany' : 'Niezalogowany'}</Typography>
                <Divider sx={{ my: 2 }} />
                <Box textAlign="left" sx={{ pl: 2 }}>
                  <Button fullWidth component={Link} to="/" sx={{ justifyContent: 'flex-start', mb: 1 }}>Dashboard</Button>
                  <Button fullWidth component={Link} to="/my-ratings" sx={{ justifyContent: 'flex-start', mb: 1 }}>Moje Oceny</Button>
                  <Button fullWidth component={Link} to="/gustometr" sx={{ justifyContent: 'flex-start', mb: 1 }}>Gustometr</Button>
                  <Button fullWidth component={Link} to="/rogals" sx={{ justifyContent: 'flex-start', mb: 1 }}>Lista Rogali</Button>
                  <Button fullWidth component={Link} to="/statistics" sx={{ justifyContent: 'flex-start', mb: 1 }}>Statystyki</Button>
                  <Button fullWidth component={Link} to="/recommendations" sx={{ justifyContent: 'flex-start', mb: 1 }}>Rekomendacje</Button>
                  <Button fullWidth component={Link} to="/account" sx={{ justifyContent: 'flex-start', mb: 1 }}>Ustawienia konta</Button>
                </Box>
                <Button fullWidth variant="contained" color="primary" sx={{ mt: 3 }} component={Link} to="/logout">LOG OUT</Button>
              </Box>
            </Grid>
            {/* Main Content */}
            <Grid item xs={12} md={9} sx={{ background: '#f7fafd', p: 5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={700} color="#2196f3">PERSONAL PROGRESS</Typography>
                <Button variant="contained" sx={{ background: '#b39ddb', color: '#fff', borderRadius: 3, px: 3, fontWeight: 700 }}>
                  CONTACT SUPPORT
                </Button>
              </Box>
              {loading ? (
                <Box textAlign="center" mt={8}><CircularProgress /></Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Top row cards */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">Liczba rogali</Typography>
                        <Typography variant="h3" color="#1976d2">{totalRogals}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">Średnia ocena</Typography>
                        <Typography variant="h3" color="#43a047">{stats.averageRating ? stats.averageRating.toFixed(2) : '-'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">Najlepszy rogal</Typography>
                        <Typography variant="h5" color="#b39ddb">{stats.bestRogal || '-'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* Progress tracking + goal */}
                  <Grid item xs={12} md={8}>
                    <Card sx={{ p: 2, borderRadius: 3, minHeight: 220 }}>
                      <CardContent>
                        <ProgressTracking totalRogals={totalRogals} />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, borderRadius: 3, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <ProgressDonut />
                    </Card>
                  </Grid>
                  {/* Mapa piekarni */}
                  <Grid item xs={12} md={12}>
                    <Card sx={{ p: 2, borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">Mapa piekarni</Typography>
                        <BakeriesMap year={selectedYear} />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomeModern;
