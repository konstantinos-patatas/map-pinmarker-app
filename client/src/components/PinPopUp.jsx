import React, { useState, useRef, useEffect } from 'react';
import { doc, setDoc, deleteDoc, getDoc,updateDoc,increment } from 'firebase/firestore';
import {useAuth} from '../context/AuthContext.jsx'

import {
    Box,
    Typography,
    IconButton,
    Button,
    Divider,
    Chip,
    Stack,
    useTheme,
    useMediaQuery,
    Avatar,
    Card,
    CardContent,
    Slide,
    Paper,
} from '@mui/material';
import {
    Close as CloseIcon,
    Person as PersonIcon,
    CalendarToday as CalendarTodayIcon,
    AccessTime as AccessTimeIcon,
    Note as NoteIcon,
    Verified as VerifiedIcon,
    PendingActions as PendingActionsIcon,
    Room as RoomIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Share as ShareIcon,
    Flag as FlagIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {db} from "../services/firebase.js";
import AuthModal from "./AuthModal.jsx";

export default function PinDrawer({ pin, open, onClose }) {
    const {userProfile,currentUser} = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [isFavorite, setIsFavorite] = useState(false);
    const [verification, setVerification] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [currentHeight, setCurrentHeight] = useState(120); // Collapsed height
    const drawerRef = useRef(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const COLLAPSED_HEIGHT = 170;
    const EXPANDED_HEIGHT = window.innerHeight * 0.85;

    const handleFavoriteToggle = async () => {
        if (!currentUser) {
            setAuthModalOpen(true);
            return; // stop here, wait for login
        }

        const favoriteRef = doc(db, `users/${userProfile.uid}/favorites/${pin.id}`);
        try {
            if (isFavorite) {
                await deleteDoc(favoriteRef);
            } else {
                await setDoc(favoriteRef, {
                    pinId: pin.id,
                    favoritedAt: new Date().toISOString(),
                });
            }

            setIsFavorite(!isFavorite); // Update local state
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleVerification = async (type) => {
        if (!currentUser) {
            setAuthModalOpen(true);
            return;
        }

        const pinRef = doc(db, "pins", pin.id);
        const voteRef = doc(db, `pins/${pin.id}/votes/${currentUser.uid}`);

        try {
            const voteSnap = await getDoc(voteRef);

            if (voteSnap.exists()) {
                const previousVote = voteSnap.data().vote;

                if (previousVote === type) {
                    // ✅ User clicked the same vote again -> remove it
                    const updates = {};
                    if (type === "confirmed") updates.isFreeCount = increment(-1);
                    if (type === "denied") updates.isNotFreeCount = increment(-1);

                    await updateDoc(pinRef, updates);
                    await deleteDoc(voteRef);

                    setVerification(null); // Clear UI vote
                    return;
                } else {
                    // ✅ Switching vote (from one type to the other)
                    const updates = {};
                    if (previousVote === "confirmed") updates.isFreeCount = increment(-1);
                    if (previousVote === "denied") updates.isNotFreeCount = increment(-1);
                    if (type === "confirmed") updates.isFreeCount = (updates.isFreeCount || 0) + increment(1);
                    if (type === "denied") updates.isNotFreeCount = (updates.isNotFreeCount || 0) + increment(1);

                    await updateDoc(pinRef, updates);
                    await setDoc(voteRef, { vote: type, votedAt: new Date().toISOString() });

                    setVerification(type);
                    return;
                }
            }

            // ✅ First-time vote
            const updates = {};
            if (type === "confirmed") updates.isFreeCount = increment(1);
            if (type === "denied") updates.isNotFreeCount = increment(1);

            await updateDoc(pinRef, updates);
            await setDoc(voteRef, { vote: type, votedAt: new Date().toISOString() });

            setVerification(type);
        } catch (err) {
            console.error("Verification failed", err);
        }
    };



    // Touch handlers for swipe gesture
    const handleTouchStart = (e) => {
        if (!isMobile) return;
        setDragStart({
            y: e.touches[0].clientY,
            height: currentHeight,
        });
    };

    const handleTouchMove = (e) => {
        if (!isMobile || !dragStart) return;

        const currentY = e.touches[0].clientY;
        const deltaY = dragStart.y - currentY; // Positive when swiping up
        const newHeight = Math.max(
            COLLAPSED_HEIGHT,
            Math.min(EXPANDED_HEIGHT, dragStart.height + deltaY)
        );

        setCurrentHeight(newHeight);
    };

    const handleTouchEnd = () => {
        if (!isMobile || !dragStart) return;

        // Determine final state based on current height
        if (currentHeight > (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2) {
            // Expand
            setCurrentHeight(EXPANDED_HEIGHT);
            setIsExpanded(true);
        } else {
            // Collapse
            setCurrentHeight(COLLAPSED_HEIGHT);
            setIsExpanded(false);
        }

        setDragStart(null);
    };

    const handleExpansionToggle = () => {
        if (isExpanded) {
            setCurrentHeight(COLLAPSED_HEIGHT);
            setIsExpanded(false);
        } else {
            setCurrentHeight(EXPANDED_HEIGHT);
            setIsExpanded(true);
        }
    };


    //favorite or not the button on mount
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!currentUser || !pin?.id) return;

            const favoriteRef = doc(db, `users/${currentUser.uid}/favorites/${pin.id}`);
            const docSnap = await getDoc(favoriteRef);

            setIsFavorite(docSnap.exists());
        };

        checkFavoriteStatus();
    }, [currentUser, pin?.id]);

    //preload vote of the user
    useEffect(() => {
        const fetchUserVote = async () => {
            if (!currentUser || !pin?.id) return;
            const voteRef = doc(db, `pins/${pin.id}/votes/${currentUser.uid}`);
            const snap = await getDoc(voteRef);
            if (snap.exists()) {
                setVerification(snap.data().vote);
            }
        };
        fetchUserVote();
    }, [currentUser, pin?.id]);


    // Reset state when drawer opens/closes
    useEffect(() => {
        if (open) {
            setCurrentHeight(COLLAPSED_HEIGHT);
            setIsExpanded(false);
        }
    }, [open]);

    const onAuthSuccess = async () => {
        setAuthModalOpen(false);
    };

    // Collapsed content (peek view)
    const collapsedContent = (
        <Box sx={{ p: 2, height: COLLAPSED_HEIGHT, display: 'flex', flexDirection: 'column' }}>
            {/* Drag handle */}
            <Box
                sx={{
                    width: 40,
                    height: 4,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    borderRadius: 2,
                    mx: 'auto',
                    cursor: 'pointer',
                }}
                onClick={handleExpansionToggle}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'white', flex: 1 }}>
                    {pin.streetName.displayName}
                </Typography>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '50%',
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Added by {pin.createdBy}
                </Typography>
            </Stack>

            <Button
                variant="contained"
                fullWidth
                startIcon={<RoomIcon />}
                onClick={() => window.open(pin.googleMapsUrl, '_blank')}
                sx={{ mt: 'auto', borderRadius:5}}
            >
                Get Directions
            </Button>

            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onAuthSuccess={onAuthSuccess}
            />
        </Box>
    );

    // Full content
    const fullContent = (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'rgba(13, 27, 42, 0.95)',
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* Header with drag handle */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                {/* Drag handle */}
                <Box
                    sx={{
                        width: 40,
                        height: 4,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderRadius: 2,
                        mx: 'auto',
                        mb: 2,
                        cursor: 'pointer',
                    }}
                    onClick={handleExpansionToggle}
                />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" component="h2" fontWeight={600} sx={{ color: 'white' }}>
                        {pin.streetName.displayName}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            onClick={handleExpansionToggle}
                            size="small"
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '50%',
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {/* Creator Info */}
                <Card variant="outlined" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                <PersonIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'white' }}>
                                    {pin.createdBy}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Creator
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <CalendarTodayIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {new Date(pin.createdAt).toLocaleDateString()}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <AccessTimeIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {new Date(pin.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Note */}
                {pin.note && (
                    <Card variant="outlined" sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction="row" alignItems="flex-start" spacing={1} mb={1}>
                                <NoteIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'white' }}>
                                    Notes
                                </Typography>
                            </Stack>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255,255,255,0.8)',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.5,
                                }}
                            >
                                {pin.note}
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Free or not Status */}
                <Box  sx={{ mb: 2}}>
                    <Stack direction="row" spacing={1}>
                        <Chip
                            icon={<ThumbUpIcon sx={{ color: 'success.main' }} />}
                            label={`${pin.isFreeCount || 0} said it's free`}
                            variant="outlined"
                            sx={{
                                color: 'white',
                                borderColor: 'success.main',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                '& .MuiChip-icon': {
                                    color: 'success.main',
                                }
                            }}
                        />
                        <Chip
                            icon={<ThumbDownIcon sx={{ color: 'error.main' }} />}
                            label={`${pin.isNotFreeCount || 0} said it's not`}
                            variant="outlined"
                            sx={{
                                color: 'white',
                                borderColor: 'error.main',
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                '& .MuiChip-icon': {
                                    color: 'error.main',
                                }
                            }}
                        />
                    </Stack>
                </Box>

                {/* Verification Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={2} sx={{ color: 'white' }}>
                        Is this spot actually free parking?
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant={verification === 'confirmed' ? 'contained' : 'outlined'}
                            color="success"
                            startIcon={<ThumbUpIcon />}
                            onClick={() => handleVerification('confirmed')}
                            size="small"
                            sx={{
                                ...(verification !== 'confirmed' && {
                                    borderColor: 'rgba(76, 175, 80, 0.5)',
                                    color: 'rgba(76, 175, 80, 0.8)',
                                    '&:hover': {
                                        borderColor: 'success.main',
                                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    }
                                })
                            }}
                        >
                            Yes, Free
                        </Button>
                        <Button
                            variant={verification === 'denied' ? 'contained' : 'outlined'}
                            color="error"
                            startIcon={<ThumbDownIcon />}
                            onClick={() => handleVerification('denied')}
                            size="small"
                            sx={{
                                ...(verification !== 'denied' && {
                                    borderColor: 'rgba(244, 67, 54, 0.5)',
                                    color: 'rgba(244, 67, 54, 0.8)',
                                    '&:hover': {
                                        borderColor: 'error.main',
                                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                    }
                                })
                            }}
                        >
                            Not Free
                        </Button>
                    </Stack>
                    {/*if press one of the options thank user with typography*/}
                    {verification && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, display: 'block' }}>
                            Thank you for your feedback {'\u2764'}
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Action Buttons */}
                <Stack spacing={2}>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<RoomIcon />}
                        onClick={() => window.open(pin.googleMapsUrl, '_blank')}
                        sx={{ py: 1.5, borderRadius: 5 }}
                    >
                        Get Directions
                    </Button>

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            onClick={handleFavoriteToggle}
                            color={isFavorite ? 'error' : 'primary'}
                            sx={{
                                borderRadius: 5,
                                ...(!isFavorite && {
                                    borderColor: 'rgba(25, 118, 210, 0.5)',
                                    color: 'rgba(25, 118, 210, 0.8)',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    }
                                })
                            }}
                        >
                            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </Button>
                        <IconButton
                            sx={{
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.7)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderColor: 'rgba(255,255,255,0.4)',
                                }
                            }}
                        >
                            <ShareIcon />
                        </IconButton>
                    </Stack>

                    <Button
                        variant="text"
                        startIcon={<FlagIcon />}
                        size="small"
                        color="warning"
                        sx={{
                            color: 'rgba(255, 152, 0, 0.8)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            }
                        }}
                    >
                        Report Issue
                    </Button>
                </Stack>
            </Box>

            {/*open when someone tries to favorite and they are not authenticated*/}
            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onAuthSuccess={onAuthSuccess}
            />
        </Box>
    );

    // Desktop: Non-modal sidebar
    if (!isMobile) {
        return (
            <Slide direction="right" in={open} mountOnEnter unmountOnExit>
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        width: 400,
                        height: '100vh',
                        zIndex: 1300,
                        borderTopRightRadius: 16,
                        borderBottomRightRadius: 16,
                        overflow: 'hidden',
                        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
                    }}
                >
                    {fullContent}
                </Paper>
            </Slide>
        );
    }

    // Mobile: Bottom drawer with collapse/expand
    return (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
            <Paper
                ref={drawerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                elevation={8}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: currentHeight,
                    zIndex: 1300,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
                    transition: dragStart ? 'none' : 'height 0.3s ease-out',
                    bgcolor: 'rgba(13, 27, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                {isExpanded ? fullContent : collapsedContent}
            </Paper>
        </Slide>
    );
}