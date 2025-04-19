import React, { useEffect, useState } from 'react';
import { useYear } from '../context/YearContext';
import api from '../api';
import { Box, Typography, CircularProgress } from '@mui/material';

const ProgressDonut = () => {
  const { year: selectedYear } = useYear();
  const [totalRogals, setTotalRogals] = useState(0);
  const [userVotes, setUserVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const rogalsRes = await api.get('/rogals', { params: { year: selectedYear } });
        setTotalRogals(rogalsRes.data.length);
        const userRes = await api.get('/users/me');
        const userId = userRes.data._id || userRes.data.id;
        let votes = 0;
        rogalsRes.data.forEach(rogal => {
          if (rogal.ratings && Array.isArray(rogal.ratings)) {
            votes += rogal.ratings.filter(r => r.user === userId).length;
          }
        });
        setUserVotes(votes);
      } catch (err) {
        setTotalRogals(0);
        setUserVotes(0);
      } finally {
        setLoading(false);
      }
    };
    if (selectedYear) fetchProgress();
  }, [selectedYear]);

  if (loading) return <Box textAlign="center" py={4}><CircularProgress /></Box>;

  const percent = totalRogals ? Math.round((userVotes / totalRogals) * 100) : 0;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
        <CircularProgress variant="determinate" value={percent} size={90} thickness={6} sx={{ color: '#1976d2' }} />
        <Box sx={{
          top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Typography variant="h5" component="div" color="#1976d2">{percent}%</Typography>
        </Box>
      </Box>
      <Typography variant="subtitle1" color="text.secondary">Twój progres: {userVotes} / {totalRogals} ocen</Typography>
    </Box>
  );
};

export default ProgressDonut;
