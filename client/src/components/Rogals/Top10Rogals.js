import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Container, Typography, Box, Card, CardContent, CardActions, Button } from '@mui/material';

const Top10Rogals = () => {
    const [rogals, setRogals] = useState([]);

    useEffect(() => {
        const fetchTop10Rogals = async () => {
            try {
                const res = await api.get('/rogals/top10');
                setRogals(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchTop10Rogals();
    }, []);

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                Top 10 rogali o najlepszej jakości
            </Typography>
            <Box sx={{ mt: 4 }}>
                {rogals.map((rogal, index) => (
                    <Card key={rogal._id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                {index + 1}. <Link to={`/rogals/${rogal._id}`}>{rogal.name}</Link>
                            </Typography>
                            <p></p>
                            <Typography variant="body1">
                                Średnia ocena: {rogal.averageRating && typeof rogal.averageRating === 'number' ? rogal.averageRating.toFixed(1) : 'No ratings yet'}
                            </Typography>
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

export default Top10Rogals;
