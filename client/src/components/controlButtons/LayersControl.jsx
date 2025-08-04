import React from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Card, CardContent, Chip, Fab } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import SatelliteIcon from '@mui/icons-material/Satellite';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

// Default layer options configuration
const defaultLayerOptions = [
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

export default function LayersControl({ 
    currentLayer, 
    onLayerChange, 
    position = { bottom: 24, left: 24 },
    layerOptions = defaultLayerOptions
}) {
    const [layersPanelOpen, setLayersPanelOpen] = React.useState(false);

    // Toggle layers panel
    const toggleLayersPanel = () => {
        setLayersPanelOpen(!layersPanelOpen);
    };

    // Handle layer change
    const handleLayerChange = (layerId) => {
        onLayerChange(layerId);
        setLayersPanelOpen(false);
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                ...position,
                zIndex: 1000,
            }}
        >
            {/* Layers Toggle Button */}
            <Tooltip title="Map Layers" placement="right">
                <Fab
                    size="large"
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
    );
} 