import React, { useEffect, useState } from 'react';
import { useYear } from '../../context/YearContext';
import api from '../../api';
import { Container, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF6699', '#33CC99', '#FF4444'];

const RogalCharts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { year: selectedYear } = useYear();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/rogals', { params: { year: selectedYear } });
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    if (selectedYear) fetchData();
  }, [selectedYear]);

  if (loading) return <Typography>Ładowanie wykresów...</Typography>;
  if (!data.length) return <Typography>Brak danych do wyświetlenia wykresów.</Typography>;

  // Rozkład ocen
  const ratingDistribution = [1, 2, 3, 4, 5, 6].map(val => ({
    rating: val,
    count: data.reduce((acc, rogal) => acc + (rogal.ratings ? rogal.ratings.filter(r => Math.round(r.rating) === val).length : 0), 0)
  }));

  // Rozkład cen
  const priceData = data.map(rogal => ({ name: rogal.name, price: rogal.price }));

  // Rozkład wag
  const weightData = data.map(rogal => ({ name: rogal.name, weight: rogal.weight }));



  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Wizualizacje danych o rogalach</Typography>
        <Box sx={{ my: 4 }}>
          <Typography variant="h6">Rozkład ocen</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingDistribution} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ my: 4 }}>
          <Typography variant="h6">Ceny rogali</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priceData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ my: 4 }}>
          <Typography variant="h6">Wagi rogali</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weightData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="weight" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

      </Box>
    </Container>
  );
};

export default RogalCharts;
