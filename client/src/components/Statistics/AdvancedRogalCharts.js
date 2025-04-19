import React, {useEffect, useState} from 'react';
import {useYear} from '../../context/YearContext';
import api from '../../api';
import {Box, Container, Typography} from '@mui/material';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const AdvancedRogalCharts = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const {year: selectedYear} = useYear();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await api.get('/rogals', {params: {year: selectedYear}});
                setData(res.data);
            } finally {
                setLoading(false);
            }
        };
        if (selectedYear) fetchData();
    }, [selectedYear]);

    if (loading) return <Typography>Ładowanie zaawansowanych wykresów...</Typography>;
    if (!data.length) return <Typography>Brak danych do wyświetlenia wykresów.</Typography>;

    const priceToQuality = data.map(r => ({
        name: r.name,
        price: parseFloat(r.price),
        avgRating: r.ratings.length > 0 ? r.ratings.reduce((sum, x) => sum + x.rating, 0) / r.ratings.length : 0
    })).filter(r => r.price > 0 && r.avgRating > 0);

    const priceToWeight = data.map(r => ({
        name: r.name,
        price: parseFloat(r.price),
        weight: parseFloat(r.weight)
    })).filter(r => r.price > 0 && r.weight > 0);

    const ratingVariance = data.map(r => {
        const ratings = r.ratings.map(x => x.rating);
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        const variance = ratings.length > 1 ? ratings.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (ratings.length - 1) : 0;
        return {name: r.name, variance};
    });

    return (
        <Container>
            <Box sx={{mt: 4}}>
                <Typography variant="h5" gutterBottom>Zaawansowane analizy i wykresy</Typography>
                <Typography variant="subtitle1">Stosunek ceny do jakości</Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                        <CartesianGrid/>
                        <XAxis dataKey="price" name="Cena" unit=" zł"/>
                        <YAxis dataKey="avgRating" name="Średnia ocena"/>
                        <Tooltip cursor={{strokeDasharray: '3 3'}}/>
                        <Scatter name="Rogale" data={priceToQuality} fill="#1976d2"/>
                    </ScatterChart>
                </ResponsiveContainer>
                <Typography variant="subtitle1" sx={{mt: 4}}>Stosunek ceny do wagi</Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                        <CartesianGrid/>
                        <XAxis dataKey="price" name="Cena" unit=" zł"/>
                        <YAxis dataKey="weight" name="Waga" unit=" g"/>
                        <Tooltip cursor={{strokeDasharray: '3 3'}}/>
                        <Scatter name="Rogale" data={priceToWeight} fill="#43a047"/>
                    </ScatterChart>
                </ResponsiveContainer>
                <Typography variant="subtitle1" sx={{mt: 4}}>Wariancja ocen rogali (stabilność ocen)</Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingVariance}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name" hide/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Bar dataKey="variance" fill="#ff9800" name="Wariancja ocen"/>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Container>
    );
};

export default AdvancedRogalCharts;
