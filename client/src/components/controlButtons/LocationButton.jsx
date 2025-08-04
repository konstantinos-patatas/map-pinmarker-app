import React from 'react';
import { Fab, CircularProgress, Tooltip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';

export default function LocationButton({ 
    loading, 
    locationMethod, 
    deviceInfo, 
    onClick,
    position = { bottom: 10, right: 10 }
}) {
    // Generate tooltip text based on current state
    const getTooltipText = () => {
        if (loading) {
            return 'Getting your location...';
        }
        
        switch (locationMethod) {
            case 'gps':
                return 'GPS Location Active - Tap to refresh';
            case 'ip':
                return 'IP Location - Tap for GPS location';
            case 'fallback':
                return 'Default Location - Tap to get your location';
            default:
                return 'Get your location';
        }
    };

    return (
        <Tooltip 
            title={getTooltipText()}
            placement="left"
            arrow
        >
            <Fab
                aria-label="locate me"
                onClick={onClick}
                disabled={loading}
            sx={{
                position: 'absolute',
                ...position,
                zIndex: 1000,
                background: loading 
                    ? 'linear-gradient(135deg, rgba(99, 179, 237, 0.8) 0%, rgba(99, 179, 237, 0.6) 100%)'
                    : locationMethod === 'gps'
                    ? 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)'
                    : locationMethod === 'ip'
                    ? 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)'
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
                ...(deviceInfo?.isIOS && {
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
        </Tooltip>
    );
} 