import React, {useEffect, useState} from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Box, IconButton } from '@mui/material';
import { Close as CloseIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import theme from '../theme.js';
import {getFullAddressFromCoordinates} from "../utils/getStreetName.js";

export default function PinNoteModal({ open, onClose, onConfirm, coordinates }) {
    const [note, setNote] = useState('');

    //get the street name to display to user
    const [displayName, setDisplayName] = useState('');
    useEffect(() => {
        if (open && coordinates?.lat && coordinates?.lng) {
            (async () => {
                const { displayName } = await getFullAddressFromCoordinates(coordinates.lat, coordinates.lng);
                setDisplayName(displayName);
            })();
        }
    }, [open, coordinates]);

    const handleConfirm = () => {
        onConfirm(note);
        setNote('');
        onClose();
    };

    const handleCancel = () => {
        setNote('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleCancel}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                    backdropFilter: 'blur(10px)',
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(4px)',
                }
            }}
        >
            {/* Header with gradient background */}
            <Box sx={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(30, 41, 59, 0.9) 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                }
            }}>
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 2,
                    position: 'relative',
                    zIndex: 1,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <LocationIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                            Add Free Parking Pin
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCancel}
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: 'white',
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            </Box>

            <DialogContent sx={{ p: 3, pt: 2.5 }}>
                {/* Coordinates display */}
                <Box sx={{
                    mb: 3,
                    p: 2,
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    borderRadius: 2,
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}>
                    <Box sx={{
                        backgroundColor: theme.colors.primary,
                        borderRadius: '50%',
                        width: 8,
                        height: 8,
                    }} />
                    <Typography variant="body2" sx={{
                        color: theme.colors.primary,
                        fontWeight: 500,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                    }}>
                        {displayName || `${coordinates?.lat?.toFixed(5)}, ${coordinates?.lng?.toFixed(5)}`}
                    </Typography>
                </Box>

                {/* Note input */}
                <TextField
                    autoFocus
                    label="Add a note"
                    placeholder="e.g., Free parking after 6pm and weekends"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.95)',
                            },
                            '&.Mui-focused': {
                                backgroundColor: 'white',
                                boxShadow: `0 0 0 3px rgba(30, 41, 59, 0.1)`,
                            },
                            '& fieldset': {
                                borderColor: 'rgba(226, 232, 240, 0.8)',
                                transition: 'border-color 0.2s ease',
                            },
                            '&:hover fieldset': {
                                borderColor: theme.colors.primary,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: theme.colors.primary,
                                borderWidth: 2,
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'rgba(71, 85, 105, 0.8)',
                            '&.Mui-focused': {
                                color: theme.colors.primary,
                            },
                        },
                    }}
                />

                <Typography variant="caption" sx={{
                    color: 'rgba(71, 85, 105, 0.7)',
                    display: 'block',
                    fontStyle: 'italic',
                }}>
                    💡 Add any useful information about this location
                </Typography>
            </DialogContent>

            <DialogActions sx={{
                p: 3,
                pt: 1,
                gap: 1.5,
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
            }}>
                <Button
                    onClick={handleCancel}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        color: 'rgba(71, 85, 105, 0.8)',
                        fontWeight: 500,
                        '&:hover': {
                            backgroundColor: 'rgba(226, 232, 240, 0.6)',
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1,
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(30, 41, 59, 0.9) 100%)`,
                        boxShadow: '0 4px 12px rgba(30, 41, 59, 0.3)',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        '&:hover': {
                            background: `linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, ${theme.colors.primary} 100%)`,
                            boxShadow: '0 6px 16px rgba(30, 41, 59, 0.4)',
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Add Pin
                </Button>
            </DialogActions>
        </Dialog>
    );
}