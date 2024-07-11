import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import api from '../../api';

const EditRogal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        weight: '',
        image: null,
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchRogal = async () => {
            try {
                const res = await api.get(`/rogals/${id}`);
                const { name, description, price, weight } = res.data;
                setFormData({ name, description, price: price.toString(), weight: weight.toString(), image: null });
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchRogal();
    }, [id]);

    const { name, description, price, weight, image } = formData;

    const onChange = (e) => {
        if (e.target.name === 'image') {
            setFormData({ ...formData, image: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const formattedPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')).toFixed(2) : parseFloat(price).toFixed(2);
        const rogalData = new FormData();
        rogalData.append('name', name);
        rogalData.append('description', description);
        rogalData.append('price', formattedPrice);
        rogalData.append('weight', weight);
        if (image) {
            rogalData.append('image', image);
        }

        try {
            await api.put(`/rogals/${id}`, rogalData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(true);
            setError(null);
            navigate('/rogals');
        } catch (err) {
            const errorMsg = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'An error occurred';
            setError(errorMsg);
            setSuccess(false);
        }
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Edytuj rogala
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Rogal został zaktualizowany pomyślnie!</Alert>}
            <form onSubmit={onSubmit}>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Nazwa"
                        name="name"
                        value={name}
                        onChange={onChange}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Cena"
                        name="price"
                        value={price}
                        onChange={onChange}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Waga"
                        name="weight"
                        type="number"
                        value={weight}
                        onChange={onChange}
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
                            name="image"
                            hidden
                            onChange={onChange}
                        />
                    </Button>
                    {image && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {image.name}
                        </Typography>
                    )}
                </Box>
                <Button type="submit" variant="contained" color="primary">
                    Zapisz zmiany
                </Button>
            </form>
        </Container>
    );
};

export default EditRogal;
