import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import api from '../../api';

const GOOGLE_LIBRARIES = ['places'];
const containerStyle = {
  width: '100%',
  height: '300px',
};

const BakeryDetails = () => {
  const { bakeryName } = useParams();
  const [bakery, setBakery] = React.useState(null);
  const [rogal, setRogal] = React.useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  React.useEffect(() => {
    // Pobierz pierwszego rogala z tej piekarni
    api.get(`/rogals?bakeryName=${encodeURIComponent(bakeryName)}`).then(res => {
      const found = res.data.find(r => r.bakery && r.bakery.name === bakeryName);
      setRogal(found || null);
      setBakery(found ? found.bakery : null);
    });
  }, [bakeryName]);

  if (!bakery) return <Container><Typography>Nie znaleziono piekarni.</Typography></Container>;
  if (!isLoaded) return <Container><Typography>Ładowanie mapy...</Typography></Container>;

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 2 }}>{bakery.name}</Typography>
      <Typography variant="body1">Adres: {bakery.address}</Typography>
      <Box sx={{ mt: 2, mb: 4 }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: bakery.lat, lng: bakery.lng }}
          zoom={15}
        >
          <Marker position={{ lat: bakery.lat, lng: bakery.lng }} />
        </GoogleMap>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Rogal z tej piekarni:</Typography>
      {rogal ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">{bakery.name}</Typography>
          <Typography variant="body2">{rogal.description}</Typography>
          <Typography variant="body2">Cena: {rogal.price}</Typography>
          <Typography variant="body2">Waga: {rogal.weight}</Typography>
          <Link to={`/rogals/${rogal._id}`}>Zobacz szczegóły rogala</Link>
        </Box>
      ) : (
        <Typography>Brak rogala przypisanego do tej piekarni.</Typography>
      )}
    </Container>
  );
}

export default BakeryDetails;
