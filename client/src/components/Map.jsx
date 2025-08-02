import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Fab } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import UserIcon from "./UserIcon.jsx";
import PinPopUp from "./PinPopUp.jsx";
import UserLocationIcon from "../icons/UserLocationIcon.jsx";
import HeartIcon from "../icons/HeartIcon.jsx";
import ParkingIcon from "../icons/ParkingIcon.jsx";


// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
        },
    });
    return null;
}

//helper react function to programmatically change location when user navigates elsewhere
function RecenterMap({ lat, lng }) {
    const map = useMapEvents({});
    React.useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 22, { animate: true });
        }
    }, [lat, lng, map]);
    return null;
}

export default function Map({ onMapClick, currentUser }) {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pins, setPins] = useState([]); // store pins from Firestore
    const [pinsLoading, setPinsLoading] = useState(true);

    // New state for drawer
    const [selectedPin, setSelectedPin] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    //state to hold favorite pins of the user and fetch on mount if user is logged in if not then empty
    const [favoriteIds, setFavoriteIds] = useState([]);
    useEffect(() => {
        if (!currentUser?.uid) {
            setFavoriteIds([]); // Clear out any old data if user logs out
            return;
        }

        const favoritesRef = collection(db, `users/${currentUser.uid}/favorites`);
        const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.data().pinId);
            setFavoriteIds(ids);
        });

        return () => unsubscribe();
    }, [currentUser?.uid]);


    // fallback position - Limassol, Cyprus
    const fallbackPosition = { lat: 34.67503960521671, lng: 33.043841190472115 };

    // function to get user location
    const getUserLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                setLoading(false);
            },
            () => {
                setError('Unable to retrieve your location');
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // Handle pin click
    const handlePinClick = (pin) => {
        setSelectedPin(pin);
        setDrawerOpen(true);
    };

    // Handle drawer close
    const handleDrawerClose = () => {
        setDrawerOpen(false);
        // Clear selected pin after animation completes
        setTimeout(() => setSelectedPin(null), 300);
    };

    // Set up real-time listener for pins
    useEffect(() => {
        console.log('Setting up real-time pins listener...');

        const q = query(
            collection(db, 'pins'),
            orderBy('createdAt', 'desc') // newest pins first
        );

        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const pinsData = [];
                querySnapshot.forEach((doc) => {
                    pinsData.push({ id: doc.id, ...doc.data() });
                });
                setPins(pinsData);
                setPinsLoading(false);
                console.log(`Real-time update: ${pinsData.length} pins loaded`);
            },
            (error) => {
                console.error('Error with pins listener:', error);
                setPinsLoading(false);
                setError('Failed to load pins in real-time');
            }
        );

        // Cleanup listener on unmount
        return () => {
            console.log('Cleaning up pins listener');
            unsubscribe();
        };
    }, []);

    // get location automatically on mount
    useEffect(() => {
        getUserLocation();
        // Note: pins are now loaded via real-time listener above
    }, []);

    if (loading || pinsLoading) {
        return (
            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <CircularProgress />
                <div style={{ textAlign: 'center', color: '#666' }}>
                    {loading && 'Getting your location...'}
                    {pinsLoading && 'Loading pins...'}
                </div>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: 'var(--app-height)',
                width: '100vw',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Show alert message if error */}
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10000,
                        width: '90%',
                        maxWidth: 600,
                    }}
                >
                    {error}
                </Alert>
            )}

            <MapContainer
                center={[position?.lat || fallbackPosition.lat, position?.lng || fallbackPosition.lng]}
                zoom={22}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                attributionControl={false}
            >
                {/*adding layer where you can see normal and satellite map*/}
                <LayersControl position="bottomleft">
                    <LayersControl.BaseLayer checked name="Street View">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satellite View">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="Tiles &copy; Esri"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* User location marker */}
                {position && <Marker position={[position.lat, position.lng]} icon={UserLocationIcon} />}

                {/* User-added pins - now with click handlers instead of popups */}
                {pins.map((pin) => (
                    <Marker
                        key={pin.id}
                        position={[pin.lat, pin.lng]}
                        icon={
                            currentUser && favoriteIds.includes(pin.id)
                                ? HeartIcon()       // Function that returns the icon
                                : ParkingIcon       // Already an icon instance
                        }
                        eventHandlers={{
                            click: () => handlePinClick(pin),
                        }}
                    />
                ))}

                {/* Handle map clicks */}
                {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

                <RecenterMap
                    lat={position?.lat || fallbackPosition.lat}
                    lng={position?.lng || fallbackPosition.lng}
                />
            </MapContainer>

            {/* Floating "Locate Me" button */}
            <Fab
                color="primary"
                aria-label="locate me"
                onClick={getUserLocation}
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                }}
            >
                <MyLocationIcon />
            </Fab>

            <Box
                component={'div'}
                sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                }}
            >
                <UserIcon />
            </Box>

            {/* New PinDrawer component */}
            {selectedPin && (
                <PinPopUp
                    pin={selectedPin}
                    open={drawerOpen}
                    onClose={handleDrawerClose}
                />
            )}
        </Box>
    );
}