import React, { useState, useCallback } from 'react';
import { Fab, Tooltip, Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthModal from "../AuthModal.jsx";

const AddPinButton = React.forwardRef(({ 
    onAddPin,
    position = { bottom: 80, right: 10 },
    deviceInfo 
}, ref) => {
    const { currentUser } = useAuth();
    const [isAddingPin, setIsAddingPin] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [pendingPinCoords, setPendingPinCoords] = useState(null);

    // Handle add pin button click
    const handleAddPinClick = () => {
        if (!currentUser) {
            // Show auth modal if user is not authenticated
            setAuthModalOpen(true);
            return;
        }
        
        // Start add pin mode
        setIsAddingPin(true);
        setPendingPinCoords(null);
    };

    // Handle auth success
    const handleAuthSuccess = () => {
        setAuthModalOpen(false);
        // If user just authenticated, start add pin mode
        setIsAddingPin(true);
        setPendingPinCoords(null);
    };

    // Handle cancel add pin
    const handleCancelAddPin = () => {
        setIsAddingPin(false);
        setPendingPinCoords(null);
    };

    // Handle confirm pin location
    const handleConfirmPinLocation = () => {
        if (pendingPinCoords) {
            onAddPin(pendingPinCoords.lat, pendingPinCoords.lng);
            setIsAddingPin(false);
            setPendingPinCoords(null);
        }
    };

    // Update pin coordinates (this will be called from parent component)
    const updatePinCoordinates = useCallback((lat, lng) => {
        if (isAddingPin) {
            setPendingPinCoords({ lat, lng });
        }
    }, [isAddingPin]);

    // Expose the update function to parent
    React.useImperativeHandle(ref, () => ({
        updatePinCoordinates
    }));

    return (
        <>
            {/* Add Pin Button */}
            <Tooltip 
                title={isAddingPin ? "Cancel adding pin" : "Add free parking spot"}
                placement="left"
                arrow
            >
                <Fab
                    aria-label="add pin"
                    onClick={isAddingPin ? handleCancelAddPin : handleAddPinClick}
                    sx={{
                        position: 'absolute',
                        ...position,
                        zIndex: 1000,
                        background: isAddingPin
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.7) 100%)'
                            : 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        width: 56,
                        height: 56,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            background: isAddingPin
                                ? 'linear-gradient(135deg, rgba(239, 68, 68, 1) 0%, rgba(239, 68, 68, 0.8) 100%)'
                                : 'linear-gradient(135deg, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0.8) 100%)',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                            transform: 'translateY(-1px)',
                        },
                        '&:active': {
                            transform: 'translateY(0px)',
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
                    {isAddingPin ? <CloseIcon /> : <AddIcon />}
                </Fab>
            </Tooltip>

            {/* Add Pin Mode Overlay */}
            {isAddingPin && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2000,
                        pointerEvents: 'none',
                    }}
                >
                    {/* Centered Pin Indicator */}
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.7) 100%)',
                            border: '3px solid white',
                            boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': {
                                    transform: 'scale(1)',
                                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
                                },
                                '50%': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.8)',
                                },
                                '100%': {
                                    transform: 'scale(1)',
                                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
                                },
                            },
                        }}
                    >
                        <AddIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                    </Box>
                </Box>
            )}

            {/* Add Pin Instructions */}
            {isAddingPin && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2000,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center',
                        maxWidth: '300px',
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        📍 Add Parking Spot
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Move the map to position the pin, then tap "Add Pin" below
                    </Typography>
                </Box>
            )}

            {/* Confirm Pin Button */}
            {isAddingPin && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2000,
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={handleConfirmPinLocation}
                        sx={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.7) 100%)',
                            color: 'white',
                            borderRadius: '25px',
                            padding: '12px 24px',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0.8) 100%)',
                                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        Add Pin
                    </Button>
                </Box>
            )}

            {/* Auth Modal */}
            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onAuthSuccess={handleAuthSuccess}
            />
        </>
    );
});

export default AddPinButton; 