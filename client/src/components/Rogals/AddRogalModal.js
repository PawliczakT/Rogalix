import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import api from '../../api';

const AddRogalPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedPrice = parseFloat(price.replace(',', '.')).toFixed(2);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', formattedPrice);
        formData.append('weight', weight);
        formData.append('image', image);

        try {
            await api.post('/rogals', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(true);
            setError(null);
        } catch (err) {
            const errorMsg = err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg
                : 'An error occurred';
            setError(errorMsg);
            setSuccess(false);
        }
    };

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                Dodaj rogala
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Rogal został dodany pomyślnie!</Alert>}
            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Nazwa"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Cena"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Waga"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                    >
                        Załaduj zdjęcie
                        <input
                            type="file"
                            hidden
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </Button>
                </Box>
                <Button type="submit" variant="contained" color="primary">
                    Dodaj rogala
                </Button>
            </form>
        </Container>
    );
};

export default AddRogalPage;
