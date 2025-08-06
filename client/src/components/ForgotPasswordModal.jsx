import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    Typography,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../context/AuthContext.jsx';

const ForgotPasswordModal = ({ open, onClose, initialEmail = '' }) => {
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');

    const { resetPassword } = useAuth();

    // Set initial email when dialog opens
    useEffect(() => {
        if (open) {
            setResetEmail(initialEmail);
            setResetMessage('');
            setResetError('');
        }
    }, [open, initialEmail]);

    const handleClose = () => {
        if (!resetLoading) {
            setResetEmail('');
            setResetMessage('');
            setResetError('');
            onClose();
        }
    };

    const handlePasswordReset = async () => {
        if (!resetEmail.trim()) {
            setResetError('Please enter your email address');
            return;
        }

        setResetLoading(true);
        setResetError('');
        setResetMessage('');

        try {
            const result = await resetPassword(resetEmail.trim());

            if (result.success) {
                setResetMessage(result.message);
                // Close dialog after 2 seconds
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                setResetError(result.error);
            }
        } catch (error) {
            setResetError('An unexpected error occurred. Please try again.');
            console.error('Reset password error:', error);
        }

        setResetLoading(false);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !resetLoading && resetEmail.trim()) {
            handlePasswordReset();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: 'rgba(13, 27, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(179, 234, 255, 0.2)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }
            }}
        >
            <DialogTitle sx={{
                color: '#e0e1dd',
                fontWeight: 600,
                borderBottom: '1px solid rgba(179, 234, 255, 0.1)',
                pb: 2
            }}>
                Reset Your Password
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
                <Typography sx={{ color: '#b3eaff', mb: 3, fontSize: '0.95rem' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </Typography>

                {resetError && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            color: '#ff5252',
                            border: '1px solid rgba(244, 67, 54, 0.3)',
                            borderRadius: 2,
                            '& .MuiAlert-icon': { color: '#ff5252' }
                        }}
                    >
                        {resetError}
                    </Alert>
                )}

                {resetMessage && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 2,
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: '#4caf50',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            borderRadius: 2,
                            '& .MuiAlert-icon': { color: '#4caf50' }
                        }}
                    >
                        {resetMessage}
                    </Alert>
                )}

                <TextField
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    fullWidth
                    required
                    disabled={resetLoading}
                    autoFocus
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon sx={{ color: '#b3eaff', fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'rgba(179, 234, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease',
                            '& fieldset': {
                                borderColor: 'rgba(179, 234, 255, 0.3)',
                                borderWidth: 1.5,
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(179, 234, 255, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#00bfff',
                                boxShadow: '0 0 0 3px rgba(0, 191, 255, 0.1)',
                            },
                        },
                        '& .MuiInputBase-input': {
                            color: '#e0e1dd',
                            fontSize: '1rem',
                        },
                        '& .MuiInputLabel-root': {
                            color: '#b3eaff',
                            fontWeight: 500,
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={resetLoading}
                    sx={{
                        color: '#b3eaff',
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 2,
                        px: 3,
                        '&:hover': {
                            backgroundColor: 'rgba(179, 234, 255, 0.05)',
                        }
                    }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={handlePasswordReset}
                    disabled={resetLoading || !resetEmail.trim()}
                    variant="contained"
                    startIcon={resetLoading ? <CircularProgress size={16} sx={{ color: '#0d1b2a' }} /> : null}
                    sx={{
                        background: 'linear-gradient(45deg, #00bfff 30%, #40c4ff 90%)',
                        color: '#0d1b2a',
                        borderRadius: 2,
                        px: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(0, 191, 255, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #0099cc 30%, #33b5e5 90%)',
                            boxShadow: '0 6px 16px rgba(0, 191, 255, 0.4)',
                        },
                        '&:disabled': {
                            background: 'linear-gradient(45deg, #666 30%, #888 90%)',
                            color: '#ccc',
                            boxShadow: 'none',
                        }
                    }}
                >
                    {resetLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ForgotPasswordModal;