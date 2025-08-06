import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
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
import SettingsIcon from '@mui/icons-material/Settings';
import Button from "@mui/material/Button";
import AuthModal from "../AuthModal.jsx";
import AccountSettings from "../AccountSettings.jsx";
import theme from "../../theme.js";

export default function UserIcon() {
    const { userProfile, logout, currentUser } = useAuth();
    const user = userProfile;
    const [anchorEl, setAnchorEl] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

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
            await logout();
            handleUserMenuClose();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Handle settings click
    const handleSettingsClick = () => {
        setSettingsOpen(true);
        handleUserMenuClose();
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
                        src={user?.photoURL || undefined}
                        sx={{
                            width: 50,
                            height: 50,
                            backgroundColor: 'black',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 0 15px rgba(0, 191, 255, 0.4)',
                        }}
                    >
                        {user?.photoURL ? '' : user ? getUserInitials(user.fullName, user.email) : <PersonIcon />}
                    </Avatar>
                </IconButton>
            </Tooltip>

            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onAuthSuccess={handleAuthSuccess}
            />

            <AccountSettings
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
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
                                src={user?.photoURL || undefined}
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
                                {user?.photoURL ? '' : getUserInitials(user.fullName, user.email)}
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

                        {/* SETTINGS BUTTON */}
                        <MenuItem
                            onClick={handleSettingsClick}
                            sx={{
                                justifyContent: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Button
                                startIcon={<SettingsIcon />}
                                sx={{
                                    fontSize: '18px',
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
                                        color: '#00bfff',
                                        backgroundColor: 'rgba(0, 191, 255, 0.3)',
                                    },
                                }}
                            >
                                Settings
                            </Button>
                        </MenuItem>

                        {/* SIGN OUT BUTTON */}
                        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                justifyContent: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                pb: 2,
                            }}
                        >
                            <Button
                                startIcon={<LogoutIcon />}
                                sx={{
                                    fontSize: '18px',
                                    color: 'white',
                                    fontWeight: 'normal',
                                    textShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s',
                                    textTransform: 'none',
                                    borderRadius:'15px',
                                    width:'fit-content',
                                    backgroundColor:'rgba(255, 193, 7, 0.2)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
                                        color: '#ffc107',
                                        backgroundColor: 'rgba(255, 193, 7, 0.3)',
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