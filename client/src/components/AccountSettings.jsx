import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Box,
    Typography,
    Divider,
    Button,
    Alert,
    Card,
    CardContent,
    TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import theme from "../theme.js";
import IconButton from "@mui/material/IconButton";

export default function AccountSettings({ open, onClose }) {
    const { userProfile, deleteAccount } = useAuth();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const user = userProfile;

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (confirmText !== 'DELETE') {
            return; // Don't proceed if confirmation text doesn't match
        }

        try {
            setIsDeleting(true);
            await deleteAccount();
            setDeleteDialogOpen(false);
            onClose();
            // Account is deleted, user will be automatically signed out
        } catch (error) {
            console.error('Delete account error:', error);
            alert('Error deleting account: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setConfirmText('');
    };

    const isDeleteEnabled = confirmText === 'DELETE';

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: theme.colors.primary,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 125, 255, 0.2)',
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white', fontWeight: 'bold', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon />
                        Account Settings
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="medium"
                        sx={{
                            position:'absolute',
                            top:10,
                            right:10,
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
                        <CloseIcon fontSize="medium" />
                    </IconButton>

                </DialogTitle>

                <DialogContent
                    sx={{
                        pb: 3,
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
                        },
                }}>
                    {/* Profile Information Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                            Profile Information
                        </Typography>
                        <Card sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <CardContent>
                                <Typography sx={{ color: 'white', mb: 1 }}>
                                    <strong>Name:</strong> {user?.fullName || 'Not set'}
                                </Typography>
                                <Typography sx={{ color: 'white', mb: 1 }}>
                                    <strong>Email:</strong> {user?.email}
                                </Typography>
                                <Typography sx={{ color: 'white', mb: 1 }}>
                                    <strong>Account Created:</strong> {new Date(user?.createdAt).toLocaleDateString()}
                                </Typography>
                                <Typography sx={{ color: 'white' }}>
                                    <strong>Auth Method:</strong> {user?.authMethod || 'Email'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

                    {/* Danger Zone */}
                    <Box>
                        <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon />
                            Danger Zone
                        </Typography>

                        <Alert
                            severity="warning"
                            sx={{
                                mb: 2,
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                color: 'rgba(255, 193, 7, 0.9)',
                                border: '1px solid rgba(255, 152, 0, 0.2)',
                            }}
                        >
                            Once you delete your account, there is no going back. Please be certain.
                        </Alert>

                        <Card sx={{
                            backgroundColor: 'rgba(255, 107, 107, 0.05)',
                            border: '1px solid rgba(255, 107, 107, 0.2)'
                        }}>
                            <CardContent>
                                <Typography sx={{ color: 'white', mb: 2 }}>
                                    <strong>Delete Account</strong>
                                </Typography>
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2, fontSize: '14px' }}>
                                    Permanently remove your account and all associated data. This action cannot be undone.
                                </Typography>
                                <Button
                                    onClick={handleDeleteClick}
                                    startIcon={<DeleteIcon />}
                                    variant="outlined"
                                    sx={{
                                        color: '#ff6b6b',
                                        borderColor: '#ff6b6b',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                            borderColor: '#ff5252',
                                            color: '#ff5252',
                                        },
                                    }}
                                >
                                    Delete Account
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            color: 'white',
                            borderRadius: '8px',
                            px: 3,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: theme.colors.primary,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(255, 68, 68, 0.3)',
                    }
                }}
            >
                <DialogTitle sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon />
                        Confirm Account Deletion
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                        This will permanently delete your account and all associated data.
                        This action cannot be undone.
                    </DialogContentText>

                    <Typography sx={{ color: 'white', mb: 2 }}>
                        To confirm, type <strong style={{ color: '#ff6b6b' }}>DELETE</strong> in the box below:
                    </Typography>

                    <TextField
                        fullWidth
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#ff6b6b',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button
                        onClick={handleDeleteCancel}
                        disabled={isDeleting}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '8px',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        disabled={!isDeleteEnabled || isDeleting}
                        variant="contained"
                        sx={{
                            backgroundColor: isDeleteEnabled ? '#ff4444' : 'rgba(255, 68, 68, 0.3)',
                            color: 'white',
                            borderRadius: '8px',
                            '&:hover': {
                                backgroundColor: isDeleteEnabled ? '#ff3333' : 'rgba(255, 68, 68, 0.3)',
                                transform: isDeleteEnabled ? 'translateY(-2px)' : 'none',
                            },
                            '&:disabled': {
                                color: 'rgba(255, 255, 255, 0.5)',
                            },
                        }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}