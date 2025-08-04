import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Alert, Fab, Paper, Typography, IconButton, Tooltip, Card, CardContent, Chip, Button } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import UserIcon from "./UserIcon.jsx";
import PinPopUp from "./PinPopUp.jsx";
import UserLocationIcon from "../icons/UserLocationIcon.jsx";
import HeartIcon from "../icons/HeartIcon.jsx";
import ParkingIcon from "../icons/ParkingIcon.jsx";
import MapIcon from '@mui/icons-material/Map';
import SatelliteIcon from '@mui/icons-material/Satellite';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
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
    const [layersPanelOpen, setLayersPanelOpen] = useState(false);

    // Enhanced location tracking state
    const [locationMethod, setLocationMethod] = useState(null); // 'gps', 'ip', 'manual'
    const [locationPermission, setLocationPermission] = useState('unknown'); // 'granted', 'denied', 'unknown'
    const [shouldRecenterMap, setShouldRecenterMap] = useState(true); // Only recenter on initial load or manual request
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [locationAttempts, setLocationAttempts] = useState(0);

    // Device detection
    const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
    const [locationStrategy, setLocationStrategy] = useState(getLocationStrategy());

    // fallback position - Limassol, Cyprus
    const fallbackPosition = { lat: 34.67503960521671, lng: 33.043841190472115 };

    // Detect device capabilities on mount
    useEffect(() => {
        const device = getDeviceInfo();
        const strategy = getLocationStrategy();
        
        setDeviceInfo(device);
        setLocationStrategy(strategy);

        // Set initial position based on device capabilities
        if (device.supportsGeolocation) {
            // For iOS Safari, we'll show a prompt instead of auto-requesting
            if (strategy.requiresUserInteraction) {
                setShowLocationPrompt(true);
                setPosition(fallbackPosition);
                setLocationMethod('fallback');
            } else {
                // For other devices, try to get location automatically
                handleLocationRequest();
            }
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
            
            // Show manual location prompt as fallback
            setShowLocationPrompt(true);
            setPosition(fallbackPosition);
            setLocationMethod('fallback');
            setError('Unable to get your location automatically. Please use the location button below.');
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

    // Toggle layers panel
    const toggleLayersPanel = () => {
        setLayersPanelOpen(!layersPanelOpen);
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

    // Layer options configuration
    const layerOptions = [
        {
            id: 'street',
            label: 'Street',
            description: 'Detailed street map with roads and landmarks',
            icon: MapIcon,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            id: 'satellite',
            label: 'Satellite',
            description: 'High-resolution satellite imagery',
            icon: SatelliteIcon,
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
        }
    ];

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

            {/* Universal location guidance */}
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
                        📍 Enable Location Access
                    </Box>
                    <Box sx={{ fontSize: '0.875rem', lineHeight: 1.5, opacity: 0.9 }}>
                        {deviceInfo.isIOS ? (
                            deviceInfo.isPWA ? (
                                <>
                                    <Box sx={{ mb: 1 }}>
                                        <strong>PWA Mode:</strong> You're using the app in standalone mode
                                    </Box>
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
            </MapContainer>

            {/* Enhanced Location Button */}
            <Fab
                aria-label="locate me"
                onClick={handleManualLocationRequest}
                disabled={loading}
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    background: loading 
                        ? 'linear-gradient(135deg, rgba(99, 179, 237, 0.8) 0%, rgba(99, 179, 237, 0.6) 100%)'
                        : locationMethod === 'gps'
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.7) 100%)'
                        : locationMethod === 'ip'
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(245, 158, 11, 0.7) 100%)'
                        : 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    width: 56,
                    height: 56,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        background: loading 
                            ? 'linear-gradient(135deg, rgba(99, 179, 237, 0.9) 0%, rgba(99, 179, 237, 0.7) 100%)'
                            : locationMethod === 'gps'
                            ? 'linear-gradient(135deg, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0.8) 100%)'
                            : locationMethod === 'ip'
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 1) 0%, rgba(245, 158, 11, 0.8) 100%)'
                            : 'linear-gradient(135deg, rgba(13, 27, 42, 1) 0%, rgba(25, 45, 65, 1) 100%)',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0px)',
                    },
                    '&:disabled': {
                        opacity: 0.7,
                        cursor: 'not-allowed',
                    },
                    // iOS-specific styling
                    ...(deviceInfo.isIOS && {
                        width: 64,
                        height: 64,
                        fontSize: '1.2rem',
                        '& .MuiSvgIcon-root': {
                            fontSize: '1.5rem'
                        }
                    })
                }}
            >
                {loading ? (
                    <CircularProgress size={24} color="inherit" />
                ) : locationMethod === 'gps' ? (
                    <LocationOnIcon />
                ) : locationMethod === 'ip' ? (
                    <LocationOffIcon />
                ) : (
                    <MyLocationIcon />
                )}
            </Fab>

            {/* Modern Layers Control */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    left: 24,
                    zIndex: 1000,
                }}
            >
                {/* Layers Toggle Button */}
                <Tooltip title="Map Layers" placement="top">
                    <Fab
                        size="medium"
                        onClick={toggleLayersPanel}
                        sx={{
                            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, rgba(13, 27, 42, 1) 0%, rgba(25, 45, 65, 1) 100%)',
                                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                                transform: 'translateY(-1px)',
                            },
                            '&:active': {
                                transform: 'translateY(0px)',
                            },
                        }}
                    >
                        <LayersIcon />
                    </Fab>
                </Tooltip>

                {/* Modern Layers Panel */}
                {layersPanelOpen && (
                    <Paper
                        elevation={0}
                        sx={{
                            position: 'absolute',
                            bottom: 60,
                            left: 0,
                            p: 0,
                            minWidth: 320,
                            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: 4,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                            overflow: 'hidden',
                            animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '@keyframes slideUp': {
                                from: {
                                    transform: 'translateY(20px)',
                                    opacity: 0,
                                },
                                to: {
                                    transform: 'translateY(0)',
                                    opacity: 1,
                                },
                            },
                        }}
                    >
                        {/* Header */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 3,
                            pb: 2
                        }}>
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight="700"
                                    color="white"
                                    sx={{ fontSize: '1rem', letterSpacing: '-0.025em' }}
                                >
                                    Map Style
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="rgba(255, 255, 255, 0.7)"
                                    sx={{ fontSize: '0.75rem', mt: 0.5 }}
                                >
                                    Choose your preferred view
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={toggleLayersPanel}
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    width: 32,
                                    height: 32,
                                    '&:hover': {
                                        color: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    }
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Layer Options */}
                        <Box sx={{ px: 3, pb: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {layerOptions.map((layer) => {
                                    const IconComponent = layer.icon;
                                    const isSelected = currentLayer === layer.id;

                                    return (
                                        <Card
                                            key={layer.id}
                                            onClick={() => handleLayerChange(layer.id)}
                                            sx={{
                                                cursor: 'pointer',
                                                border: isSelected
                                                    ? '2px solid rgba(99, 179, 237, 0.8)'
                                                    : '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 3,
                                                backgroundColor: isSelected
                                                    ? 'rgba(99, 179, 237, 0.15)'
                                                    : 'rgba(255, 255, 255, 0.08)',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                boxShadow: isSelected
                                                    ? '0 4px 20px rgba(99, 179, 237, 0.3)'
                                                    : '0 2px 8px rgba(0, 0, 0, 0.2)',
                                                '&:hover': {
                                                    transform: 'scale(1.02)',
                                                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
                                                    borderColor: isSelected
                                                        ? 'rgba(99, 179, 237, 0.9)'
                                                        : 'rgba(255, 255, 255, 0.3)',
                                                    backgroundColor: isSelected
                                                        ? 'rgba(99, 179, 237, 0.2)'
                                                        : 'rgba(255, 255, 255, 0.12)',
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                    {/* Preview */}
                                                    <Box
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 2,
                                                            background: layer.gradient,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <IconComponent
                                                            sx={{
                                                                color: 'white',
                                                                fontSize: '1.25rem',
                                                                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Content */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight="600"
                                                                color="white"
                                                                sx={{ fontSize: '0.875rem' }}
                                                            >
                                                                {layer.label}
                                                            </Typography>
                                                            {isSelected && (
                                                                <Chip
                                                                    icon={<CheckIcon sx={{ fontSize: '0.875rem' }} />}
                                                                    label="Active"
                                                                    size="small"
                                                                    sx={{
                                                                        height: 20,
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600,
                                                                        backgroundColor: 'rgba(99, 179, 237, 0.9)',
                                                                        color: 'white',
                                                                        border: '1px solid rgba(99, 179, 237, 0.3)',
                                                                        '& .MuiChip-icon': {
                                                                            color: 'white',
                                                                            fontSize: '0.75rem'
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                        <Typography
                                                            variant="body2"
                                                            color="rgba(255, 255, 255, 0.7)"
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                lineHeight: 1.4
                                                            }}
                                                        >
                                                            {layer.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>

            {/* Enhanced Location Status Indicator */}
            {(locationAccuracy || locationMethod) && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 80,
                        right: 24,
                        zIndex: 1000,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: 120,
                    }}
                >
                    {locationMethod === 'gps' ? (
                        <LocationOnIcon sx={{ fontSize: '16px', color: '#22c55e' }} />
                    ) : locationMethod === 'ip' ? (
                        <LocationOffIcon sx={{ fontSize: '16px', color: '#f59e0b' }} />
                    ) : (
                        <MyLocationIcon sx={{ fontSize: '16px' }} />
                    )}
                    <Box>
                        <Box sx={{ fontWeight: 600, fontSize: '11px' }}>
                            {locationMethod === 'gps' && locationAccuracy && formatAccuracy(locationAccuracy)} accuracy
                        </Box>
                        <Box sx={{ fontSize: '10px', opacity: 0.8 }}>
                            {getLocationMethodDisplay(locationMethod)}
                        </Box>
                    </Box>
                </Box>
            )}

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