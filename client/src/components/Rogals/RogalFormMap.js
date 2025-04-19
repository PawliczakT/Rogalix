import React, {useCallback, useEffect, useRef, useState} from 'react';
import {GoogleMap} from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '250px',
};

const POZNAN_CENTER = {lat: 52.4064, lng: 16.9252};

const RogalFormMap = ({isLoaded, lat, lng, onMapClick}) => {

    const [mapInstance, setMapInstance] = useState(null);
    const markerRef = useRef(null);

    const onLoad = useCallback(map => {
        setMapInstance(map);
    }, []);

    const onUnmount = useCallback(map => {
        setMapInstance(null);
        if (markerRef.current) {
            markerRef.current.map = null;
            markerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!mapInstance || !isLoaded || !window.google?.maps?.marker) {
            return;
        }

        if (markerRef.current) {
            markerRef.current.map = null;
            markerRef.current = null;
        }

        const currentLat = parseFloat(lat);
        const currentLng = parseFloat(lng);

        if (!isNaN(currentLat) && !isNaN(currentLng)) {
            const position = {lat: currentLat, lng: currentLng};

            try {
                markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
                    position,
                    map: mapInstance,
                    title: 'Wybrana lokalizacja',
                });
            } catch (error) {
                console.error("Error creating AdvancedMarkerElement in RogalFormMap:", error);
            }
        }
    }, [mapInstance, isLoaded, lat, lng]);

    if (!isLoaded) return <div>Ładowanie mapy...</div>;

    const center = !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))
        ? {lat: parseFloat(lat), lng: parseFloat(lng)}
        : POZNAN_CENTER;
    const zoom = !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)) ? 15 : 11;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={(e) => {
                if (onMapClick) {
                    onMapClick({lat: e.latLng.lat(), lng: e.latLng.lng()});
                }
            }}
            options={{
                gestureHandling: 'cooperative',
                mapId: process.env.REACT_APP_GOOGLE_MAP_ID
            }}
        >
        </GoogleMap>
    );
};

export default RogalFormMap;
