import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Alert, Fab } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import UserIcon from "./controlButtons/UserIcon.jsx";
import PinPopUp from "./PinPopUp.jsx";
import UserLocationIcon from "../icons/UserLocationIcon.jsx";
import HeartIcon from "../icons/HeartIcon.jsx";
import ParkingIcon from "../icons/ParkingIcon.jsx";
import LayersControl from "./controlButtons/LayersControl.jsx";
import LocationButton from "./controlButtons/LocationButton.jsx";
import AddPinButton from "./controlButtons/AddPinButton.jsx";
import { 
    getDeviceInfo, 
    requestLocationWithFallback, 
    getLocationStrategy,
    formatAccuracy,
    getLocationMethodDisplay
} from '../utils/locationUtils.js';

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
function RecenterMap({ lat, lng, shouldRecenter }) {
    const map = useMapEvents({});
    React.useEffect(() => {
        if (lat && lng && shouldRecenter) {
            map.setView([lat, lng], 22, { animate: true });
        }
    }, [lat, lng, shouldRecenter, map]);
    return null;
}

// Component to track map center coordinates
function MapCenterTracker({ onCenterChange }) {
    const map = useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            onCenterChange(center.lat, center.lng);
        },
    });
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

    // New state for continuous location tracking
    const [locationWatchId, setLocationWatchId] = useState(null);
    const [locationAccuracy, setLocationAccuracy] = useState(null);

    // Custom layers control state
    const [currentLayer, setCurrentLayer] = useState('street');

    // Enhanced location tracking state
    const [locationMethod, setLocationMethod] = useState(null); // 'gps', 'ip', 'manual'
    const [locationPermission, setLocationPermission] = useState('unknown'); // 'granted', 'denied', 'unknown'
    const [shouldRecenterMap, setShouldRecenterMap] = useState(true); // Only recenter on initial load or manual request
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [locationAttempts, setLocationAttempts] = useState(0);

    // Device detection
    const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
    const [locationStrategy, setLocationStrategy] = useState(getLocationStrategy());
    
    // Map center tracking for AddPinButton
    const [mapCenter, setMapCenter] = useState(null);
    const addPinButtonRef = React.useRef();

    // fallback position - Limassol, Cyprus
    const fallbackPosition = { lat: 34.67503960521671, lng: 33.043841190472115 };

    // Detect device capabilities and attempt location on mount
    useEffect(() => {
        const device = getDeviceInfo();
        const strategy = getLocationStrategy();
        
        setDeviceInfo(device);
        setLocationStrategy(strategy);

        // Always try to get location first, regardless of device
        if (device.supportsGeolocation) {
            // Try to get location automatically first
            handleLocationRequest();
        } else {
            // Fallback for devices without geolocation support
            handleLocationRequest();
        }
    }, []);

    // Simplified location request using utilities
    const handleLocationRequest = useCallback(async () => {
        setLoading(true);
        setError(null);
        setLocationAttempts(prev => prev + 1);

        try {
            const locationData = await requestLocationWithFallback();
            
            setPosition({
                lat: locationData.lat,
                lng: locationData.lng,
            });
            setLocationMethod(locationData.method);
            setLocationAccuracy(locationData.accuracy);
            setLocationPermission('granted');
            setError(null);
            setShowLocationPrompt(false);

        } catch (error) {
            console.log('Location request failed:', error);
            
            // Only show prompt if GPS and IP location both failed
            // Check if it's a permission denied error specifically
            if (error.message === 'Location permission denied' || 
                error.message === 'Unable to determine location') {
                setShowLocationPrompt(true);
                setPosition(fallbackPosition);
                setLocationMethod('fallback');
                setError('Location access is needed. Please enable location services and try again.');
            } else {
                // For other errors (timeout, network issues), just set fallback without showing prompt
                setPosition(fallbackPosition);
                setLocationMethod('fallback');
                setError('Unable to get your location. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Start continuous location tracking
    const startLocationTracking = useCallback(() => {
        if (!navigator.geolocation || locationWatchId) return;

        const watchOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
        };

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                setLocationAccuracy(pos.coords.accuracy);
                setError(null);
                setShouldRecenterMap(false);
            },
            (error) => {
                console.log('Location tracking error:', error);
                // Don't show errors for watch failures, just log them
            },
            watchOptions
        );

        setLocationWatchId(watchId);
    }, [locationWatchId]);

    // Stop location tracking
    const stopLocationTracking = useCallback(() => {
        if (locationWatchId) {
            navigator.geolocation.clearWatch(locationWatchId);
            setLocationWatchId(null);
        }
    }, [locationWatchId]);

    // Handle manual location request
    const handleManualLocationRequest = () => {
        setShowLocationPrompt(false);
        setShouldRecenterMap(true);
        handleLocationRequest();
    };

    // Handle layer change
    const handleLayerChange = (layerId) => {
        setCurrentLayer(layerId);
    };

    // Handle add pin from AddPinButton
    const handleAddPinFromButton = (lat, lng) => {
        // Use the same logic as the original map click handler
        if (onMapClick) {
            onMapClick(lat, lng);
        }
    };

    // Handle map center change
    const handleMapCenterChange = (lat, lng) => {
        setMapCenter({ lat, lng });
        // Update AddPinButton coordinates if it's in add mode
        if (addPinButtonRef.current?.updatePinCoordinates) {
            addPinButtonRef.current.updatePinCoordinates(lat, lng);
        }
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

    // Start tracking after initial location is obtained
    useEffect(() => {
        if (position && !locationWatchId && locationMethod === 'gps') {
            const timer = setTimeout(() => {
                startLocationTracking();
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [position, locationWatchId, locationMethod, startLocationTracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopLocationTracking();
        };
    }, [stopLocationTracking]);



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

            {/* Location Access Guidance */}
            {showLocationPrompt && (
                <Alert
                    severity="info"
                    onClose={() => setShowLocationPrompt(false)}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10000,
                        width: '90%',
                        maxWidth: 600,
                        backgroundColor: 'rgba(13, 27, 42, 0.95)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        '& .MuiAlert-icon': {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }}
                >
                    <Box sx={{ fontWeight: 600, mb: 1 }}>
                        📍 Location Access Required
                    </Box>
                    <Box sx={{ fontSize: '0.875rem', lineHeight: 1.5, opacity: 0.9 }}>
                        <Box sx={{ mb: 1 }}>
                            We couldn't access your location. Please enable location services:
                        </Box>
                        {deviceInfo.isIOS ? (
                            deviceInfo.isPWA ? (
                                <>
                                    <Box sx={{ mb: 1 }}>
                                        <strong>Step 1:</strong> Go to Settings → Privacy → Location Services
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <strong>Step 2:</strong> Find this app and set it to "While Using App"
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <strong>Step 3:</strong> Return here and tap the location button below
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Box sx={{ mb: 1 }}>
                                        <strong>Step 1:</strong> Go to Settings → Privacy → Location Services
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <strong>Step 2:</strong> Find "Safari" and set it to "While Using App"
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <strong>Step 3:</strong> Return here and tap the location button below
                                    </Box>
                                    <Box sx={{ fontSize: '0.8rem', opacity: 0.7, mt: 1 }}>
                                        💡 Tip: For better location access, add this app to your home screen
                                    </Box>
                                </>
                            )
                        ) : deviceInfo.isAndroid ? (
                            <>
                                <Box sx={{ mb: 1 }}>
                                    <strong>Step 1:</strong> Tap "Allow" when prompted for location access
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                    <strong>Step 2:</strong> If not prompted, go to Settings → Apps → Browser → Permissions → Location
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                    <strong>Step 3:</strong> Set to "Allow while using app"
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box sx={{ mb: 1 }}>
                                    <strong>Step 1:</strong> Tap "Allow" when your browser asks for location access
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                    <strong>Step 2:</strong> If not prompted, check your browser's location settings
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                    <strong>Step 3:</strong> Tap the location button below to try again
                                </Box>
                            </>
                        )}
                        <Box sx={{ fontSize: '0.8rem', opacity: 0.7, mt: 1 }}>
                            💡 Tip: For best experience, use Chrome, Safari, or Firefox
                        </Box>
                    </Box>
                </Alert>
            )}

            <MapContainer
                center={[position?.lat || fallbackPosition.lat, position?.lng || fallbackPosition.lng]}
                zoom={22}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                attributionControl={false}
            >
                {/* Custom layers control - Street View */}
                {currentLayer === 'street' && (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                )}

                {/* Custom layers control - Satellite View */}
                {currentLayer === 'satellite' && (
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles &copy; Esri"
                    />
                )}

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
                    shouldRecenter={shouldRecenterMap}
                />
                
                <MapCenterTracker onCenterChange={handleMapCenterChange} />
            </MapContainer>

            {/* Location Button Component */}
            <LocationButton
                loading={loading}
                locationMethod={locationMethod}
                deviceInfo={deviceInfo}
                onClick={handleManualLocationRequest}
            />


            {/* Add Pin Button Component */}
            <AddPinButton
                ref={addPinButtonRef}
                onAddPin={handleAddPinFromButton}
                deviceInfo={deviceInfo}
                position={{ bottom: 75, left: 10 }}
            />

            {/* Layers Control Component */}
            <LayersControl 
                currentLayer={currentLayer}
                onLayerChange={handleLayerChange}
                position={{ left: 10, bottom: 15 }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
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