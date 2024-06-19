import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Container, Typography, Button, Box, Card, CardContent, CardActions } from '@mui/material';

const RogalListPage = () => {
    const [rogals, setRogals] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRogals = async () => {
            try {
                const res = await api.get('/rogals');
                setRogals(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchRogals();
    }, []);

    const deleteRogal = async (id) => {
        try {
            await api.delete(`/rogals/${id}`);
            setRogals(rogals.filter((rogal) => rogal._id !== id));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                Wszystkie rogale
            </Typography>
            <Box sx={{ mt: 4 }}>
                {rogals.map((rogal) => (
                    <Card key={rogal._id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                <Link to={`/rogals/${rogal._id}`}>{rogal.name}</Link>
                            </Typography>
                            <Typography variant="body1">{rogal.description}</Typography>
                            <Typography variant="body1">Price: {rogal.price}</Typography>
                            <Typography variant="body1">Weight: {rogal.weight}</Typography>
                            <Typography variant="body1">Average Rating: {rogal.averageRating !== undefined ? rogal.averageRating.toFixed(1) : 'No ratings yet'}</Typography>
                            <Typography variant="body1">Quality to Price Ratio: {rogal.qualityToPriceRatio !== undefined ? rogal.qualityToPriceRatio.toFixed(2) : 'N/A'}</Typography>
                            <Typography variant="body1">Price per Kg: {rogal.pricePerKg !== undefined ? rogal.pricePerKg.toFixed(2) : 'N/A'}</Typography>
                            <Typography variant="body1">Number of Votes: {rogal.ratings.length}</Typography>
                            {rogal.image && <img src={`http://localhost:5000/${rogal.image}`} alt={rogal.name} />}
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="secondary" onClick={() => deleteRogal(rogal._id)}>Delete</Button>
                            <Button size="small" color="primary" onClick={() => navigate(`/rogals/edit/${rogal._id}`)}>Edit</Button>
                        </CardActions>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default RogalListPage;
