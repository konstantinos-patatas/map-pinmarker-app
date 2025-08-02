import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import { useAuth } from '../context/AuthContext.jsx';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#0d1b2a',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    minWidth: { xs: 300, md: 400 },
    color: '#e0e1dd',
    textAlign: 'center',
};

const a11yProps = index => ({
    id: `auth-tab-${index}`,
    'aria-controls': `auth-tabpanel-${index}`,
});

export default function AuthModal({ open, onClose, onAuthSuccess }) {
    const { login, signup } = useAuth();
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Signup state
    const [signupFullName, setSignupFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirm, setSignupConfirm] = useState('');
    const [signupError, setSignupError] = useState('');

    const handleTabChange = (e, newValue) => {
        setTab(newValue);
        setLoginError('');
        setSignupError('');
    };

    const clearForm = () => {
        setLoginEmail('');
        setLoginPassword('');
        setSignupFullName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirm('');
        setLoginError('');
        setSignupError('');
    };

    const handleLogin = async e => {
        e.preventDefault();
        setLoginError('');

        if (!loginEmail || !loginPassword) {
            setLoginError('Please enter both email and password.');
            return;
        }

        try {
            setLoading(true);
            await login(loginEmail, loginPassword);
            clearForm();
            onClose();
            // Call success callback if provided
            if (onAuthSuccess) {
                onAuthSuccess();
            }
        } catch (err) {
            setLoginError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async e => {
        e.preventDefault();
        setSignupError('');

        if (!signupFullName || !signupEmail || !signupPassword || !signupConfirm) {
            setSignupError('Please fill in all fields.');
            return;
        }

        if (signupPassword !== signupConfirm) {
            setSignupError('Passwords do not match.');
            return;
        }

        if (signupPassword.length < 6) {
            setSignupError('Password must be at least 6 characters long.');
            return;
        }

        try {
            setLoading(true);
            // Pass the fullName parameter to signup
            await signup(signupEmail, signupPassword, signupFullName);
            clearForm();
            onClose();
            // Call success callback if provided
            if (onAuthSuccess) {
                onAuthSuccess();
            }
        } catch (err) {
            setSignupError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        clearForm();
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="firebase-auth-modal">
            <Box sx={modalStyle}>
                <Typography id="firebase-auth-modal" variant="h5" sx={{ mb: 2 }}>
                    {tab === 0 ? 'Log In to Your Account' : 'Create an Account'}
                </Typography>
                <Divider sx={{ mb: 2, bgcolor: '#b3eaff' }} />

                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    centered
                    textColor="inherit"
                    TabIndicatorProps={{ style: { display: 'none' } }}
                    sx={{
                        mb: 4,
                        borderRadius: 3,
                        border: "1.5px solid #00bfff",
                        width: "fit-content",
                        mx: "auto",
                        background: "rgba(0,191,255,0.02)",
                    }}
                >
                    <Tab label="Login" {...a11yProps(0)} sx={{
                        color: tab === 0 ? '#0d1b2a' : '#00bfff',
                        fontWeight: 'bold',
                        background: tab === 0 ? '#00bfff' : 'transparent',
                        borderRadius: 3,
                        minWidth: 100,
                    }} />
                    <Tab label="Sign Up" {...a11yProps(1)} sx={{
                        color: tab === 1 ? '#0d1b2a' : '#00bfff',
                        fontWeight: 'bold',
                        background: tab === 1 ? '#00bfff' : 'transparent',
                        borderRadius: 3,
                        minWidth: 100,
                    }} />
                </Tabs>

                {/* Login Form */}
                {tab === 0 && (
                    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            fullWidth
                            required
                            disabled={loading}
                            sx={{
                                input: { color: '#e0e1dd' },
                                label: { color: '#b3eaff' },
                                '& fieldset': { borderColor: '#b3eaff', borderRadius: 3 }
                            }}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            fullWidth
                            required
                            disabled={loading}
                            sx={{
                                input: { color: '#e0e1dd' },
                                label: { color: '#b3eaff' },
                                '& fieldset': { borderColor: '#b3eaff', borderRadius: 3 }
                            }}
                        />
                        {loginError && <Typography color="error" sx={{ fontSize: '0.95rem' }}>{loginError}</Typography>}
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                background: '#00bfff',
                                color: '#0d1b2a',
                                borderRadius: 3,
                                mt: 2,
                                '&:disabled': { background: '#666', color: '#ccc' }
                            }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Box>
                )}

                {/* Signup Form */}
                {tab === 1 && (
                    <Box component="form" onSubmit={handleSignup} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Full Name"
                            variant="outlined"
                            value={signupFullName}
                            onChange={e => setSignupFullName(e.target.value)}
                            fullWidth
                            required
                            disabled={loading}
                            sx={{
                                input: { color: '#e0e1dd' },
                                label: { color: '#b3eaff' },
                                '& fieldset': { borderColor: '#b3eaff', borderRadius: 3 }
                            }}
                        />
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={signupEmail}
                            onChange={e => setSignupEmail(e.target.value)}
                            fullWidth
                            required
                            disabled={loading}
                            sx={{
                                input: { color: '#e0e1dd' },
                                label: { color: '#b3eaff' },
                                '& fieldset': { borderColor: '#b3eaff', borderRadius: 3 }
                            }}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={signupPassword}
                            onChange={e => setSignupPassword(e.target.value)}
                            fullWidth
                            required
                            disabled={loading}
                            sx={{
                                input: { color: '#e0e1dd' },
                                label: { color: '#b3eaff' },
                                '& fieldset': { borderColor: '#b3eaff', borderRadius: 3 }
                            }}
                        />
                        <TextField
                            label="Confirm Password"
                            type="password"
                            variant="outlined"
                            value={signupConfirm}
                            onChange={e => setSignupConfirm(e.target.value)}
                            fullWidth
                            required
                            disabled={loading}
                            sx={{
                                input: { color: '#e0e1dd' },
                                label: { color: '#b3eaff' },
                                '& fieldset': { borderColor: '#b3eaff', borderRadius: 3 }
                            }}
                        />
                        {signupError && <Typography color="error" sx={{ fontSize: '0.95rem' }}>{signupError}</Typography>}
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                background: '#00bfff',
                                color: '#0d1b2a',
                                borderRadius: 3,
                                mt: 2,
                                '&:disabled': { background: '#666', color: '#ccc' }
                            }}
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </Button>
                    </Box>
                )}

                <Button
                    onClick={handleClose}
                    disabled={loading}
                    sx={{
                        color: '#b3eaff',
                        mt: 3,
                        textTransform: 'none',
                        '&:disabled': { color: '#666' }
                    }}
                >
                    Close
                </Button>
            </Box>
        </Modal>
    );
}