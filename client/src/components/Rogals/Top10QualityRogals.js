import React, { useEffect, useState } from 'react';
import { useYear } from '../../context/YearContext';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Container, Typography, Box, Card, CardContent, CardActions, Button } from '@mui/material';

const Top10QualityRogals = () => {
    const { year: selectedYear } = useYear();
    const [rogals, setRogals] = useState([]);

    useEffect(() => {
        const fetchTop10QualityRogals = async () => {
            try {
                const res = await api.get('/rogals/top10quality', { params: { year: selectedYear } });
                setRogals(res.data);
            } catch (err) {
                console.error(err.response?.data || err.message);
            }
        };

        fetchTop10QualityRogals();
    }, [selectedYear]);

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                Top 10 rogali z najlepszym stosunkiem jakości do ceny
            </Typography>
            <Box sx={{ mt: 4 }}>
                {rogals.map((rogal, index) => (
                    <Card key={rogal._id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                {index + 1}. <Link to={`/rogals/${rogal._id}`}>{rogal.name}</Link>
                            </Typography>
                            <p></p>
                            <Typography variant="body1">Stosunek jakości do ceny: {rogal.qualityToPriceRatio.toFixed(2)}</Typography>
                        </CardContent>
                        <CardActions>
                        </CardActions>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default Top10QualityRogals;
