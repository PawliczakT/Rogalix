import React, { useEffect, useState } from 'react';
import { useYear } from '../context/YearContext';
import api from '../api';
import { Box, Typography, LinearProgress, Stack, CircularProgress } from '@mui/material';

const ProgressTracking = () => {
  const { year: selectedYear } = useYear();
  const [totalRogals, setTotalRogals] = useState(0);
  const [userVotes, setUserVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        // Pobierz wszystkie rogale z danego roku
        const rogalsRes = await api.get('/rogals', { params: { year: selectedYear } });
        setTotalRogals(rogalsRes.data.length);
        // Pobierz dane użytkownika (w tym oddane głosy)
        const userRes = await api.get('/users/me');
        const userId = userRes.data._id || userRes.data.id;
        // Zlicz ile ocen użytkownika jest wśród rogali z danego roku
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

  return (
    <Box>
      <Typography variant="subtitle1" color="text.secondary" mb={1}>
        Twój progres w {selectedYear} roku
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Typography variant="h6" color="#1976d2">Rogale: {totalRogals}</Typography>
        <Typography variant="h6" color="#43a047">Twoje głosy: {userVotes}</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={totalRogals ? (userVotes/totalRogals)*100 : 0} sx={{ height: 12, borderRadius: 6, background: '#e3f2fd' }} />
      <Typography variant="body2" color="text.secondary" mt={1}>
        {userVotes} z {totalRogals} rogali ocenionych ({totalRogals ? Math.round((userVotes/totalRogals)*100) : 0}%)
      </Typography>
    </Box>
  );
};

export default ProgressTracking;
