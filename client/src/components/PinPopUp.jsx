import React, { useState, useRef, useEffect } from 'react';
import { doc, setDoc, deleteDoc, getDoc,updateDoc,increment } from 'firebase/firestore';
import {useAuth} from '../context/AuthContext.jsx';

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
    Paper, Snackbar, Alert, Tooltip, Grow, Fade,
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
    Navigation as NavigationIcon,
} from '@mui/icons-material';
import {db} from "../services/firebase.js";
import AuthModal from "./AuthModal.jsx";
import EmailForm from "./EmailForm.jsx";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function PinPopUp({ pin, open, onClose }) {
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
    const [errorMessage, setErrorMessage] = useState(''); //set error if ocurs
    const [openError, setOpenError] = useState(false); //open the error alert
    const [freeVotes, setFreeVotes] = useState(pin.isFreeCount);
    const [notFreeVotes,setNotFreeVotes] = useState(pin.isNotFreeCount)

    const COLLAPSED_HEIGHT = 200;
    const EXPANDED_HEIGHT = window.innerHeight * 0.85;

    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false)

    const handleFavoriteToggle = async () => {
        if (!currentUser) {
            setAuthModalOpen(true);
            return; // Stop here, wait for login
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

            // 🔔 Show error alert in UI
            setErrorMessage('Something went wrong while updating your favorite. Please try again.');
            setOpenError(true);
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
                    if (type === "confirmed") {
                        updates.isFreeCount = increment(-1);
                    }
                    if (type === "denied") {
                        updates.isNotFreeCount = increment(-1);
                    }

                    await updateDoc(pinRef, updates);
                    await deleteDoc(voteRef);

                    setVerification(null); // Clear UI vote
                    await fetchVoteCount(); // Refresh the counts
                    return;
                } else {
                    // ✅ Switching vote (from one type to the other)
                    // This is the problematic part - we need to do this correctly
                    const updates = {};

                    // Decrement the previous vote
                    if (previousVote === "confirmed") {
                        updates.isFreeCount = increment(-1);
                    }
                    if (previousVote === "denied") {
                        updates.isNotFreeCount = increment(-1);
                    }

                    // Increment the new vote
                    if (type === "confirmed") {
                        updates.isFreeCount = increment(1);
                    }
                    if (type === "denied") {
                        updates.isNotFreeCount = increment(1);
                    }

                    await updateDoc(pinRef, updates);
                    await setDoc(voteRef, { vote: type, votedAt: new Date().toISOString() });

                    setVerification(type);
                    await fetchVoteCount();
                    return;
                }
            }

            // ✅ First-time vote
            const updates = {};
            if (type === "confirmed") {
                updates.isFreeCount = increment(1);
            }
            if (type === "denied") {
                updates.isNotFreeCount = increment(1);
            }

            await updateDoc(pinRef, updates);
            await setDoc(voteRef, { vote: type, votedAt: new Date().toISOString() });

            setVerification(type);
            await fetchVoteCount();
        } catch (err) {
            console.error("Verification failed", err);
            setErrorMessage('Something went wrong while adding your option. Please try again.');
            setOpenError(true);
        }
    };

    const handleCloseError = () => setOpenError(false); //close error alert

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

    const handleShare = async () => {
        const url = pin.googleMapsUrl || window.location.href;
        const title = `Check out this parking spot: ${pin.streetName.displayName}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Here's a parking spot shared via the app.`,
                    url: url,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(url);
                setErrorMessage("Link copied to clipboard!");
                setOpenError(true);
            } catch (error) {
                console.error('Error sharing:', error);
                setErrorMessage("Failed to copy the link. Try again.");
                setOpenError(true);
            }
        }
    };

    const handleDelete = async () => {
        // Show confirmation dialog
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the parking pin at "${pin.streetName.displayName}"?\n\nThis action cannot be undone.`
        );

        // If user cancels, exit early
        if (!confirmDelete) {
            return;
        }

        try {
            // Create reference to the specific document
            const pinDocRef = doc(db, 'pins', pin.id);

            // Delete the document
            await deleteDoc(pinDocRef);
            onClose();

            console.log('Pin deleted successfully');
        } catch (error) {
            console.error('Error deleting pin:', error);
            // Handle error (show error message to user)
            setErrorMessage('Failed to delete pin. Please try again.');
            setOpenError(true);
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
            if (!currentUser || !pin?.id) {
                setVerification(null); // Reset if no user or pin
                return;
            }

            const voteRef = doc(db, `pins/${pin.id}/votes/${currentUser.uid}`);
            const snap = await getDoc(voteRef);
            if (snap.exists()) {
                setVerification(snap.data().vote);
            } else {
                setVerification(null); // ✅ Reset if user hasn't voted on this pin
            }
        };

        fetchUserVote();
    }, [currentUser, pin?.id]);

    //get the vote counts on mount for fast refresh
    const fetchVoteCount = async () => {
        if(!pin?.id) return;

        try {
            const pinRef = doc(db, `pins/${pin.id}`);
            const snap = await getDoc(pinRef);
            if (snap.exists()) {
                const pinData = snap.data();
                setFreeVotes(pinData.isFreeCount);
                setNotFreeVotes(pinData.isNotFreeCount);
            }
        } catch (error) {
            console.error("Error fetching pin:", error);
        }
    }
    useEffect(() => {
        fetchVoteCount()
    }, [pin?.id]);



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
        <Box sx={{
            p: 2,
            height: COLLAPSED_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)',
        }}>
            {/* Modern drag handle */}
            <Box
                sx={{
                    width: 50,
                    height: 4,
                    bgcolor: 'rgba(255,255,255, 0.5)',
                    borderRadius: 2,
                    mx: 'auto',
                    cursor: 'pointer',
                }}
                onClick={handleExpansionToggle}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Box sx={{ flex: 1, mr: 2 }}  onClick={handleExpansionToggle}>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                            color: 'white',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            mb: 0.5,
                        }}
                    >
                        {pin.streetName.displayName}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 20, height: 20, bgcolor: 'rgba(255,255,255,0.2)' }}>
                            <PersonIcon sx={{ fontSize: 12 }} />
                        </Avatar>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Added by {pin.createdBy}
                        </Typography>
                    </Stack>
                </Box>

                {/* Admin/Creator only delete button */}
                {( (currentUser.email === "kpatatas15504@gmail.com") || pin.createdByEmail === currentUser.email) && (
                    <Tooltip title="Delete Pin" arrow>
                        <IconButton
                            onClick={handleDelete}
                            size="medium"
                            sx={{
                                mr:2,
                                color:'#F44336',
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '50%',
                                '&:hover': {
                                    bgcolor: 'rgba(244, 67, 54)',
                                }
                            }}
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Tooltip>
                )}

                {/*close button*/}
                <Tooltip title="Close" arrow>
                    <IconButton
                        onClick={onClose}
                        size="large"
                        sx={{
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)',
                                transform: 'scale(1.05)',
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Button
                variant="contained"
                fullWidth
                startIcon={<NavigationIcon />}
                onClick={() => window.open(pin.googleMapsUrl, '_blank')}
                sx={{
                    mt: 'auto',
                    borderRadius: 20,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                    }
                }}
            >
                Get Directions
            </Button>
        </Box>
    );

    // Full content
    const fullContent = (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                overflow:'auto',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)',
                // Custom Scrollbar Styling
                '&::-webkit-scrollbar': {
                    width: '8px',                    // Width of vertical scrollbar
                    height: '8px',                   // Height of horizontal scrollbar
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.05)',  // Track (background) color
                    borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0, 191, 255, 0.6)',     // Scrollbar thumb color
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                        background: 'rgba(0, 191, 255, 0.8)', // Thumb color on hover
                    },
                },
                '&::-webkit-scrollbar-corner': {
                    background: 'rgba(255, 255, 255, 0.05)',  // Corner where scrollbars meet
                }
            }}
        >
            {/* Header with drag handle */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }} >
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
                    <Typography variant="h6" component="h2" fontWeight={600} sx={{ color: 'white' }} >
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

                        {/* Admin/Creator only delete button */}
                        {( (currentUser.email === "kpatatas15504@gmail.com") || pin.createdByEmail === currentUser.email) && (
                            <Tooltip title="Delete Pin" arrow>
                                <IconButton
                                    onClick={handleDelete}
                                    size="medium"
                                    sx={{
                                        mr:2,
                                        color:'#F44336',
                                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '50%',
                                        '&:hover': {
                                            bgcolor: 'rgba(244, 67, 54, 0.5)',
                                        }
                                    }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        )}

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

            {/*main section below header*/}
            <Box sx={{ flex: 1, p: 2 }}>
                {/* Creator Info */}
                <Card
                    variant="outlined"
                    sx={{
                        mb: 2,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: 5,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.12)',
                            transform: 'translateY(-1px)',
                        }
                    }}
                >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 1} }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                            <Avatar sx={{
                                width: 48,
                                height: 48,
                                bgcolor: 'rgba(33, 150, 243, 0.2)',
                                border: '2px solid rgba(33, 150, 243, 0.3)',
                            }}>
                                <PersonIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                                    {pin.createdBy}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Parking spot creator
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={3}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <CalendarTodayIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {new Date(pin.createdAt).toLocaleDateString()}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <AccessTimeIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
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
                    <Grow in={true} timeout={800}>
                        <Card
                            variant="outlined"
                            sx={{
                                mb: 2,
                                bgcolor: 'rgba(255,255,255,0.08)',
                                borderColor: 'rgba(255,255,255,0.15)',
                                borderRadius: 5,
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                <Stack direction="row" alignItems="flex-start" spacing={2} mb={2}>
                                    <Box sx={{
                                        p:0.7,
                                        bgcolor: 'rgba(255, 193, 7, 0.2)',
                                        borderRadius: '50%',
                                        border: '1px solid rgba(255, 193, 7, 0.3)',
                                    }}>
                                        <NoteIcon sx={{ color: '#FFC107', fontSize: 20 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight={600} sx={{ color: 'white', mb: 1 }}>
                                            Additional Notes
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: 'rgba(255,255,255,0.9)',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {pin.note}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grow>
                )}

                {/* feedback on showing how many pressed yes and no */}
                <Box >
                    {(() => {
                        const totalVotes = (freeVotes || 0) + (notFreeVotes || 0);
                        const freePercentage = totalVotes > 0 ? (freeVotes / totalVotes) * 100 : 0;

                        // Determine trust level and message
                        const getTrustLevel = () => {
                            if (totalVotes === 0) {
                                return {
                                    icon: '❓',
                                    title: "No one reported whether it is free parking",
                                    subtitle: 'Check current conditions and add feedback 🙏',
                                    color: '#9E9E9E',
                                    bgColor: 'rgba(158, 158, 158, 0.1)',
                                    borderColor: 'rgba(158, 158, 158, 0.2)'
                                };
                            }

                            if (freePercentage >= 75) {
                                return {
                                    icon: '✅',
                                    title: 'Likely Free',
                                    subtitle: `${freeVotes} of ${totalVotes} people say it's free`,
                                    color: '#4CAF50',
                                    bgColor: 'rgba(76, 175, 80, 0.15)',
                                    borderColor: 'rgba(76, 175, 80, 0.3)'
                                };
                            } else if (freePercentage >= 25) {
                                return {
                                    icon: '⚠️',
                                    title: 'Might be free parking',
                                    subtitle: `${freeVotes} people said is free, ${notFreeVotes} people said is paid - check current conditions`,
                                    color: '#FF9800',
                                    bgColor: 'rgba(255, 152, 0, 0.1)',
                                    borderColor: 'rgba(255, 152, 0, 0.3)'
                                };
                            } else {
                                return {
                                    icon: '❌',
                                    title: 'Likely Paid',
                                    subtitle: `${notFreeVotes} of ${totalVotes} people say it's not free`,
                                    color: '#F44336',
                                    bgColor: 'rgba(244, 67, 54, 0.15)',
                                    borderColor: 'rgba(244, 67, 54, 0.3)'
                                };
                            }
                        };

                        const trustInfo = getTrustLevel();

                        return (
                            <Box sx={{
                                p: 2.5,
                                bgcolor: trustInfo.bgColor,
                                border: `2px solid ${trustInfo.borderColor}`,
                                borderRadius: 5,
                                backdropFilter: 'blur(10px)',
                            }}>
                                {/* Icon + Title Row */}
                                <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                                    <Typography
                                        sx={{
                                            fontSize: '1.8rem',
                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                                        }}
                                    >
                                        {trustInfo.icon}
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        sx={{
                                            color: trustInfo.color,
                                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {trustInfo.title}
                                    </Typography>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(255,255,255,0.9)',
                                        fontWeight: 500,
                                        lineHeight: 1.4
                                    }}
                                >
                                    {trustInfo.subtitle}
                                </Typography>
                            </Box>
                        );
                    })()}
                </Box>

                {/* Verification Section */}
                <Box sx={{ my: 3 }}>
                    <Typography variant="h6" fontWeight={600} mb={1} sx={{ color: 'white' }}>
                        Share Your Experience
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant={verification === 'confirmed' ? 'contained' : 'outlined'}
                            color="success"
                            startIcon={<ThumbUpIcon />}
                            onClick={() => handleVerification('confirmed')}
                            sx={{
                                flex: 1,
                                borderRadius: 20,
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'all 0.2s ease',
                                ...(verification !== 'confirmed' && {
                                    borderColor: 'rgba(76, 175, 80, 0.4)',
                                    color: '#4CAF50',
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    '&:hover': {
                                        borderColor: '#4CAF50',
                                        bgcolor: 'rgba(76, 175, 80, 0.2)',
                                        transform: 'translateY(-1px)',
                                    }
                                }),
                                ...(verification === 'confirmed' && {
                                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)',
                                })
                            }}
                        >
                            Yes, It's Free
                        </Button>
                        <Button
                            variant={verification === 'denied' ? 'contained' : 'outlined'}
                            color="error"
                            startIcon={<ThumbDownIcon />}
                            onClick={() => handleVerification('denied')}
                            sx={{
                                flex: 1,
                                borderRadius: 20,
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'all 0.2s ease',
                                ...(verification !== 'denied' && {
                                    borderColor: 'rgba(244, 67, 54, 0.4)',
                                    color: '#F44336',
                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                    '&:hover': {
                                        borderColor: '#F44336',
                                        bgcolor: 'rgba(244, 67, 54, 0.2)',
                                        transform: 'translateY(-1px)',
                                    }
                                }),
                                ...(verification === 'denied' && {
                                    boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)',
                                })
                            }}
                        >
                            Not Free
                        </Button>
                    </Stack>

                    {/* Success message */}
                    <Fade in={verification !== null}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                mt: 2,
                                textAlign: 'center',
                                fontStyle: 'italic',
                            }}
                        >
                            {verification && `Thank you for your feedback! 🙏`}
                        </Typography>
                    </Fade>

                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                {/* Action Buttons */}
                <Stack spacing={2}>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<NavigationIcon />}
                        onClick={() => window.open(pin.googleMapsUrl, '_blank')}
                        sx={{
                            mt: 'auto',
                            borderRadius: 20,
                            py: 1.5,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                            }
                        }}
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
                                borderRadius: 20,
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
                        <Tooltip title="Share Location" arrow>
                            <IconButton
                                onClick={handleShare}
                                sx={{
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    color: 'rgba(255,255,255,0.8)',
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    borderRadius: 20,
                                    width: 56,
                                    height: 56,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        borderColor: 'rgba(255,255,255,0.4)',
                                        color: 'white',
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                            >
                                <ShareIcon />
                            </IconButton>
                        </Tooltip>
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

                        onClick={handleOpenModal}
                    >
                        Report Issue
                    </Button>
                    {/* Modal for EmailJS report */}
                    <EmailForm open={modalOpen} onClose={handleCloseModal} />
                </Stack>

                <Snackbar
                    open={openError}
                    autoHideDuration={4000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                        {errorMessage}
                    </Alert>
                </Snackbar>
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