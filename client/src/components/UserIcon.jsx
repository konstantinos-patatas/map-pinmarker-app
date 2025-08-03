import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
    Avatar,
    Box,
    IconButton,
    Tooltip,
    Typography,
    Divider,
    Menu,
    MenuItem,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from "@mui/material/Button";
import AuthModal from "./AuthModal.jsx";
import theme from "../theme.js";


export default function UserIcon() {
    const { userProfile, logout, currentUser } = useAuth();  // get logout here
    const user = userProfile;
    const [anchorEl, setAnchorEl] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const handleAuthSuccess = () => {
        setAuthModalOpen(false);
    };

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle logout click
    const handleLogout = async () => {
        try {
            await logout();   // call firebase logout
            handleUserMenuClose(); // close menu
            // Optionally redirect or show a message here
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getUserInitials = (fullName, email) => {
        if (fullName) {
            return fullName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
        }
        return email ? email[0].toUpperCase() : 'U';
    };

    return(
        <Box sx={{ display: 'block'}}>
            <Tooltip title={user?.fullName || user?.email || 'User Profile'}>
                <IconButton
                    onClick={(event) => {
                        if (currentUser) {
                            handleUserMenuOpen(event);
                        } else {
                            setAuthModalOpen(true);
                        }
                    }}
                    sx={{
                        padding: '8px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-3px)',
                            backgroundColor: 'rgba(0, 191, 255, 0.2)',
                        },
                    }}
                >
                    <Avatar
                        sx={{
                            width: 45,
                            height: 45,
                            backgroundColor: 'black',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 0 15px rgba(0, 191, 255, 0.4)',
                        }}
                    >
                        {user ? getUserInitials(user.fullName, user.email) : <PersonIcon />}
                    </Avatar>
                </IconButton>
            </Tooltip>

            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onAuthSuccess={handleAuthSuccess}
            />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: theme.colors.primary,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 125, 255, 0.2)',
                        minWidth: '280px',
                        mt: 1,
                    }
                }}
            >
                {user && (
                    <>
                        <Box sx={{ padding: '16px 20px', textAlign: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 60,
                                    height: 60,
                                    backgroundColor: 'rgba(0, 191, 255, 0.8)',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    margin: '0 auto 12px',
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 0 20px rgba(0, 191, 255, 0.4)',
                                }}
                            >
                                {getUserInitials(user.fullName, user.email)}
                            </Avatar>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '18px',
                                    mb: 0.5
                                }}
                            >
                                {user.fullName || 'User Name'}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '14px'
                                }}
                            >
                                {user.email}
                            </Typography>
                        </Box>
                        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <Box sx={{ padding: '8px 20px' }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '12px',
                                    mb: 1
                                }}
                            >
                                Account Created At: {user.createdAt}
                            </Typography>
                        </Box>

                        {/* SIGN OUT BUTTON */}
                        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                justifyContent: 'center',       // center horizontally
                                display: 'flex',                // flex for icon+text alignment
                                alignItems: 'center',
                                gap: 1,                        // space between icon and text
                            }}
                        >
                            <Button
                                onClick={handleLogout}
                                startIcon={<LogoutIcon />}
                                sx={{
                                    fontSize: '20px',
                                    color: 'white',
                                    fontWeight: 'normal',
                                    textShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s',
                                    textTransform: 'none',
                                    borderRadius:'15px',
                                    width:'fit-content',
                                    backgroundColor:'rgba(0, 191, 255, 0.2)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
                                        color: '#ff6b6b',
                                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                    },
                                }}
                            >
                                Logout
                            </Button>
                        </MenuItem>
                    </>
                )}
            </Menu>
        </Box>
    );
}
