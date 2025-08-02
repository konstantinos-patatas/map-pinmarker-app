import React, { useState } from 'react';
import Map from '../components/Map.jsx';
import PinNoteModal from '../components/PinNoteModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import AuthModal from "../components/AuthModal.jsx";
import { Alert, Snackbar, CircularProgress, Backdrop } from "@mui/material";
import {getFullAddressFromCoordinates} from "../utils/getStreetName.js"; // Import the utility

function Home() {
    const { currentUser, userProfile } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [pendingPin, setPendingPin] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [openError, setOpenError] = useState(false);
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false); // Loading state

    const handleCloseError = () => setOpenError(false);

    const handleAddPinClick = async (lat, lng) => {
        if (!currentUser) {
            // Store coordinates and get street name for later
            setIsGeocodingLoading(true);
            const streetName = await getFullAddressFromCoordinates(lat, lng);
            setIsGeocodingLoading(false);

            setPendingPin({ lat, lng, streetName });
            setAuthModalOpen(true);
        } else {
            // User is authenticated, get street name and show note modal
            setIsGeocodingLoading(true);
            const streetName = await getFullAddressFromCoordinates(lat, lng);
            setIsGeocodingLoading(false);

            setPendingPin({ lat, lng, streetName });
            setNoteModalOpen(true);
        }
    };

    const addPinToFirestore = async (lat, lng, note = '', streetName = '') => {
        try {
            const pinData = {
                lat: parseFloat(lat.toFixed(5)),
                lng: parseFloat(lng.toFixed(5)),
                createdAt: new Date().toISOString(),
                createdBy: userProfile?.fullName || currentUser.email,
                createdByEmail: currentUser.email,
                createdByUid: currentUser.uid,
                note: note || '',
                streetName: streetName || `Free Parking Spot( ${lat.toFixed(4)}, ${lng.toFixed(4)} )`, // Add street name
                googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                verified: false
            };

            await addDoc(collection(db, 'pins'), pinData);
            console.log('Pin added successfully:', pinData);
        } catch (error) {
            console.error('Error adding pin:', error);
            setErrorMessage('Failed to add pin. Please try again.');
            setOpenError(true);
        }
    };

    const handleAuthSuccess = () => {
        setAuthModalOpen(false);
        // If there's a pending pin and user just authenticated, show note modal
        if (pendingPin && currentUser) {
            setNoteModalOpen(true);
        }
    };

    const handleNoteConfirm = (note) => {
        if (pendingPin) {
            addPinToFirestore(
                pendingPin.lat,
                pendingPin.lng,
                note,
                pendingPin.streetName // Pass the street name
            );
            setPendingPin(null);
        }
        setNoteModalOpen(false);
    };

    const handleNoteCancel = () => {
        setNoteModalOpen(false);
        setPendingPin(null);
    };

    const handleAuthClose = () => {
        setAuthModalOpen(false);
        setPendingPin(null);
    };

    return (
        <>
            <Map onMapClick={handleAddPinClick} currentUser={currentUser} />

            <AuthModal
                open={authModalOpen}
                onClose={handleAuthClose}
                onAuthSuccess={handleAuthSuccess}
            />

            <PinNoteModal
                open={noteModalOpen}
                onClose={handleNoteCancel}
                onConfirm={handleNoteConfirm}
                coordinates={pendingPin}
                streetName={pendingPin?.streetName} // Pass street name to modal
            />

            {/* Loading overlay for geocoding */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
                open={isGeocodingLoading}
            >
                <CircularProgress color="inherit" />
                <div>Getting location details...</div>
            </Backdrop>

            <Snackbar
                open={openError}
                autoHideDuration={4000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
}

export default Home;