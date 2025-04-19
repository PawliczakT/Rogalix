import React, { useEffect, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '250px',
};

const GOOGLE_LIBRARIES = ['places'];

const RogalFormMap = ({ lat, lng, onMapClick }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && lat && lng) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    }
  }, [lat, lng]);

  if (!isLoaded) return <div>Ładowanie mapy...</div>;

  return (
    <GoogleMap
      onLoad={map => (mapRef.current = map)}
      mapContainerStyle={containerStyle}
      center={lat && lng ? { lat, lng } : { lat: 52.4064, lng: 16.9252 }}
      zoom={lat && lng ? 15 : 11}
      onClick={(e) => onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
    >
      {lat && lng && <Marker position={{ lat, lng }} />}
    </GoogleMap>
  );
};

export default RogalFormMap;
