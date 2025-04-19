import React, {useState} from 'react';
import {Alert, Box, Button, Container, TextField, Typography} from '@mui/material';

import api from '../../api';
import BakeryAutocomplete from './BakeryAutocomplete';
import RogalFormMap from './RogalFormMap';
import {getGeocode, getLatLng} from 'use-places-autocomplete';

const AddRogal = ({isLoaded}) => {

    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [bakeryAddress, setBakeryAddress] = useState('');
    const [bakeryLat, setBakeryLat] = useState(null);
    const [bakeryLng, setBakeryLng] = useState(null);

    // Automatyczne geokodowanie po wpisaniu adresu ręcznie
    React.useEffect(() => {
        if (!isLoaded) return;

        if (
            bakeryAddress &&
            (bakeryLat === null || bakeryLng === null)
        ) {
            getGeocode({address: bakeryAddress})
                .then(results => getLatLng(results[0]))
                .then(({lat, lng}) => {
                    setBakeryLat(lat);
                    setBakeryLng(lng);
                })
                .catch(() => {
                    // Jeśli nie udało się znaleźć współrzędnych, nie zmieniaj
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bakeryAddress, isLoaded]);

    if (!isLoaded) return <div>Ładowanie mapy i autouzupełniania...</div>;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedPrice = parseFloat(price.replace(',', '.')).toFixed(2);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', formattedPrice);
        formData.append('weight', weight);
        formData.append('image', image);

        if (bakeryAddress) {
            formData.append('bakery[address]', bakeryAddress);
            if (bakeryLat !== null && bakeryLng !== null) {
                formData.append('bakery[lat]', bakeryLat);
                formData.append('bakery[lng]', bakeryLng);
            }
        }

        try {
            await api.post('/rogals', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(true);
            setError(null);
            setName('');
            setDescription('');
            setPrice('');
            setWeight('');
            setImage(null);
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
                Dodaj rogala
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Rogal został dodany pomyślnie! Poczekaj na zatwierdzenie przez
                administratora.</Alert>}
            <form onSubmit={handleSubmit}>
                <Box sx={{mb: 2}}>
                </Box>
                <Box sx={{mb: 2}}>
                    <TextField
                        label="Nazwa piekarni"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{mb: 2}}>
                    <BakeryAutocomplete
                        isLoaded={isLoaded}
                        onSelect={({address, lat, lng}) => {
                            setBakeryAddress(address);
                            setBakeryLat(lat);
                            setBakeryLng(lng);
                        }}
                    />
                </Box>

                <Box sx={{mb: 2}}>
                    <RogalFormMap
                        isLoaded={isLoaded}
                        lat={bakeryLat}
                        lng={bakeryLng}
                        onMapClick={({lat, lng}) => {
                            setBakeryLat(lat);
                            setBakeryLng(lng);
                        }}
                    />
                </Box>
                <Box sx={{mb: 2}}>
                    <TextField
                        label="Cena"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{mb: 2}}>
                    <TextField
                        label="Waga"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                        fullWidth
                    />
                </Box>
                <Box sx={{mb: 2}}>
                    <Button
                        variant="contained"
                        component="label"
                    >
                        Dodaj zdjęcie
                        <input
                            type="file"
                            hidden
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </Button>
                    {image && (
                        <Typography variant="body2" sx={{mt: 1}}>
                            {image.name}
                        </Typography>
                    )}
                </Box>
                <Button type="submit" variant="contained" color="primary">
                    Dodaj rogala
                </Button>
            </form>
        </Container>
    );
};

export default AddRogal;
