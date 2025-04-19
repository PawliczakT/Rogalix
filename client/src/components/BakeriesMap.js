import React, {useCallback, useEffect, useRef, useState} from 'react';
import {GoogleMap, useJsApiLoader} from '@react-google-maps/api';
import {Box, CircularProgress} from '@mui/material';
import api from '../api';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const poznanCenter = {lat: 52.4064, lng: 16.9252};
const libraries = ['marker', 'places'];

const BakeriesMap = ({year}) => {
    const {isLoaded, loadError} = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [bakeries, setBakeries] = useState([]);
    const [map, setMap] = useState(null);
    const [center, setCenter] = useState(poznanCenter);
    const [zoom, setZoom] = useState(12);
    const markersRef = useRef([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
        console.log('Map loaded (AdvancedMarker version).');
    }, []);

    const onUnmount = useCallback(function callback(mapInstance) {
        markersRef.current.forEach(marker => marker.map = null);
        markersRef.current = [];
        setMap(null);
        console.log('Map unmounted, markers cleared (AdvancedMarker version).');
    }, []);

    useEffect(() => {
        setIsLoadingData(true);
        api.get('/bakeries', {params: {year}})
            .then(res => {
                console.log('BAKERIES FROM API:', res.data);
                console.log('Bakeries data fetched (AdvancedMarker version):', res.data);
                setBakeries(res.data || []);
            })
            .catch(err => {
                console.error('Error fetching bakeries (AdvancedMarker version):', err);
                setBakeries([]);
            })
            .finally(() => {
                setIsLoadingData(false);
            });
    }, [year]);

    useEffect(() => {
        if (!map || !isLoaded || !window.google?.maps?.marker || isLoadingData) {
            if (isLoadingData) {
                console.log('Waiting for bakery data before creating markers...');
            }
            return;
        }

        console.log('Attempting to create/update Advanced Markers. Bakeries count:', bakeries.length);

        // USUŃ WSZYSTKIE STARE MARKERY
        markersRef.current.forEach(marker => {
            if (marker) marker.map = null;
        });
        markersRef.current = [];

        const bounds = new window.google.maps.LatLngBounds();
        let validBakeriesCount = 0;

        bakeries.forEach((bakery, idx) => {
            const lat = parseFloat(bakery.lat);
            const lng = parseFloat(bakery.lng);

            if (
                typeof lat === 'number' && typeof lng === 'number' &&
                !isNaN(lat) && !isNaN(lng)
            ) {
                const position = {lat, lng};

                try {
                    const marker = new window.google.maps.marker.AdvancedMarkerElement({
                        position,
                        map,
                        title: bakery.address,
                    });

                    marker.addListener('gmp-click', () => {
                        console.log('AdvancedMarker clicked:', bakery.address, position);
                    });

                    markersRef.current.push(marker);
                    bounds.extend(position);
                    validBakeriesCount++;
                } catch (error) {
                    console.error(`Error creating AdvancedMarker for ${bakery.address}:`, error);
                }
            } else {
                console.warn(`Invalid coordinates for bakery (AdvancedMarker version): ${bakery.name || bakery.address}`);
            }
        });

        console.log('Valid bakeries for Advanced Markers:', validBakeriesCount);

        if (!map) return;

        if (validBakeriesCount > 1) {
            console.log('Fitting bounds for multiple Advanced Markers.');
            map.fitBounds(bounds);
        } else if (validBakeriesCount === 1) {
            console.log('Centering on single Advanced Marker.');
            const singleMarkerPosition = markersRef.current[0]?.position;
            if (singleMarkerPosition) {
                map.setCenter(singleMarkerPosition);
                map.setZoom(15);
            } else {
                map.setCenter(poznanCenter);
                map.setZoom(12);
            }
        } else {
            console.log('No valid bakeries with coordinates, centering on default Poznan (AdvancedMarker version).');
            map.setCenter(poznanCenter);
            map.setZoom(12);
        }
    }, [map, isLoaded, bakeries, isLoadingData]);

    if (loadError) {
        console.error("Google Maps API load error:", loadError);
        return <Box textAlign="center" py={4}>Błąd ładowania API Google Maps: {loadError.message}. Sprawdź konsolę i
            konfigurację klucza API.</Box>;
    }

    if (!isLoaded) return <Box textAlign="center" py={4}><CircularProgress/> Ładowanie API mapy...</Box>;

    return (
        <Box sx={{height: containerStyle.height, width: '100%', position: 'relative', my: 2}}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    gestureHandling: 'cooperative',
                    mapId: process.env.REACT_APP_GOOGLE_MAP_ID
                }}
            >
            </GoogleMap>
        </Box>
    );
};

export default BakeriesMap;
