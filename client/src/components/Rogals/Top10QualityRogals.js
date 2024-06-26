import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Container, Typography, Box, Card, CardContent, CardActions, Button } from '@mui/material';

const Top10QualityRogals = () => {
    const [rogals, setRogals] = useState([]);

    useEffect(() => {
        const fetchTop10QualityRogals = async () => {
            try {
                const res = await api.get('/rogals/top10quality');
                setRogals(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchTop10QualityRogals();
    }, []);

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
                                {index + 1}. <Link to={`/rogals/${rogal.rogalId}`}>{rogal.name}</Link>
                            </Typography>
                            <p></p>
                            <Typography variant="body1">Stosunek jakości do ceny: {rogal.qualityToPriceRatio.toFixed(2)}</Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="primary" component={Link} to={`/rogals/${rogal._id}`}>
                                View
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default Top10QualityRogals;
