import React, { useState } from 'react';
import api from '../../api';
import { Container, Typography, Box, TextField, Button } from '@mui/material';

const AddRogal = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);

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
            setName('');
            setDescription('');
            setPrice('');
            setWeight('');
            setImage(null);
            setError(null);
            // Możesz dodać przekierowanie lub powiadomienie o sukcesie
        } catch (err) {
            const errorMsg = err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg
                : 'An error occurred';
            setError(errorMsg);
        }
    };

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                Dodaj rogala
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleSubmit}>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Nazwa"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Opis"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Cena"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Waga"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                    >
                        Wybierz zdjęcie
                        <input
                            type="file"
                            hidden
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </Button>
                </Box>
                <Box sx={{ mt: 4 }}>
                    <Button type="submit" variant="contained" color="primary">
                        Dodaj rogala
                    </Button>
                </Box>
            </form>
        </Container>
    );
};

export default AddRogal;
