import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import {
    Close as CloseIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Login as LoginIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import SocialLoginButtons from "./controlButtons/SocialButtons.jsx";
import ForgotPasswordModal from "./ForgotPasswordModal.jsx";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'rgba(13, 27, 42, 0.98)',
    borderRadius: 4,
    boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(179, 234, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    p: 0,
    minWidth: { xs: 340, md: 420 },
    maxWidth: { xs: '90vw', md: '420px' },
    height: '95%',
    color: '#e0e1dd',
    overflowY: 'auto', // Enable vertical scrolling
    border: '1px solid rgba(179, 234, 255, 0.2)',
    // Custom scrollbar styling (optional)
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'rgba(179, 234, 255, 0.1)',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'rgba(179, 234, 255, 0.3)',
        borderRadius: '4px',
        '&:hover': {
            background: 'rgba(179, 234, 255, 0.5)',
        },
    },
};

const a11yProps = index => ({
    id: `auth-tab-${index}`,
    'aria-controls': `auth-tabpanel-${index}`,
});

export default function AuthModal({ open, onClose, onAuthSuccess }) {
    const { login, signup, signInWithGoogle} = useAuth();
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    //reset password
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    // Signup state
    const [signupFullName, setSignupFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
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
        setLoginError('');
        setSignupError('');
        setShowPassword(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!loginEmail || !loginPassword) {
            setLoginError('Please enter both email and password.');
            return;
        }

        try {
            setLoading(true);
            await login(loginEmail, loginPassword); // your custom login function
            clearForm();
            onClose();
            if (onAuthSuccess) {
                onAuthSuccess();
            }
        } catch (err) {
            switch (err.code) {
                case 'auth/invalid-email':
                    setLoginError("Please enter a valid email address.");
                    break;
                case 'auth/user-disabled':
                    setLoginError("This account has been disabled. Contact support.");
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setLoginError("Incorrect email or password.");
                    break;
                case 'auth/too-many-requests':
                    setLoginError("Too many attempts. Please try again later.");
                    break;
                case 'auth/network-request-failed':
                    setLoginError("Network error. Please check your connection.");
                    break;
                case 'POST 400 (Bad Request)':
                    setSignupError(`A google account with this email exist, please log in with google using ${loginEmail}`);
                    break;
                default:
                    setLoginError("Log in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleSignup = async e => {
        e.preventDefault();
        setSignupError('');

        if (!signupFullName || !signupEmail || !signupPassword ) {
            setSignupError('Please fill in all fields.');
            return;
        }

        if (signupPassword.length < 6) {
            setSignupError('Password must be at least 6 characters long.');
            return;
        }

        try {
            setLoading(true);
            await signup(signupEmail, signupPassword, signupFullName);
            clearForm();
            onClose();
            if (onAuthSuccess) {
                onAuthSuccess();
            }
        } catch (err) {
            console.error(err)
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setSignupError("There was a problem creating your account. Please try again or log in if you already have an account with this email");
                    break;
                case 'auth/invalid-email':
                    setSignupError("Please enter a valid email address.");
                    break;
                case 'auth/weak-password':
                    setSignupError("Your password is too weak.");
                    break;
                default:
                    setSignupError("Sign up failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        clearForm();
        onClose();
    };

    // Add after handleSignup function
    const handleSocialLogin = async (provider) => {
        setLoading(true);
        try {
            let result;
            switch (provider) {
                case 'google':
                    result = await signInWithGoogle();
                    break;
                default:
                    throw new Error('Invalid provider');
            }

            if (result) {
                clearForm();
                onClose();
                if (onAuthSuccess) {
                    onAuthSuccess(result);
                }
            }
        } catch (error) {
            let errorMessage;

            switch (error.code) {
                case 'auth/account-exists-with-different-credential':
                    errorMessage = 'An account with this email already exists. You can sign in with your email and password, and your Google account will be linked automatically on next Google sign-in.';
                    break;
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Sign-in was cancelled. Please try again.';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = 'Please allow popups and try again.';
                    break;
                default:
                    errorMessage = 'Social login failed. Please try again.';
            }

            tab === 0 ? setLoginError(errorMessage) : setSignupError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    //render the state to true to open the modal below
    const handleForgotPassword = () => {
        setForgotPasswordOpen(true);
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="auth-modal"
            closeAfterTransition
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Fade in={open} timeout={300}>
                <Box sx={modalStyle}>
                    {/* Header */}
                    <Box sx={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(179, 234, 255, 0.05) 100%)',
                        p: 3,
                        borderBottom: '1px solid rgba(179, 234, 255, 0.15)',
                    }}>
                        <IconButton
                            onClick={handleClose}
                            disabled={loading}
                            sx={{
                                position: 'absolute',
                                right: 12,
                                top: 12,
                                color: '#b3eaff',
                                bgcolor: 'rgba(179, 234, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(179, 234, 255, 0.2)',
                                    transform: 'scale(1.05)',
                                },
                                '&:disabled': {
                                    color: '#666',
                                    bgcolor: 'rgba(102, 102, 102, 0.1)',
                                }
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>

                        <Box sx={{ textAlign: 'center', pr: 4 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    mb: 1,
                                    fontWeight: 700,
                                    background: 'linear-gradient(45deg, #00bfff, #b3eaff)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}
                            >
                                {tab === 0 ? 'Welcome Back' : 'Join Us'}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'rgba(224, 225, 221, 0.8)',
                                    fontWeight: 400,
                                }}
                            >
                                {tab === 0 ? 'Sign in to your account' : 'Create your account'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Tab Navigation */}
                    <Box sx={{ p: 3, pb: 0 }}>
                        <Tabs
                            value={tab}
                            onChange={handleTabChange}
                            centered
                            variant="fullWidth"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                bgcolor: 'rgba(179, 234, 255, 0.05)',
                                border: '1px solid rgba(179, 234, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                '& .MuiTabs-indicator': {
                                    display: 'none',
                                },
                                '& .MuiTab-root': {
                                    borderRadius: 2,
                                    margin: '4px',
                                    minHeight: 48,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s ease',
                                }
                            }}
                        >
                            <Tab
                                icon={<LoginIcon sx={{ fontSize: 18 }} />}
                                iconPosition="start"
                                label="Sign In"
                                {...a11yProps(0)}
                                sx={{
                                    color: tab === 0 ? '#0d1b2a' : '#b3eaff',
                                    bgcolor: tab === 0 ? '#00bfff' : 'transparent',
                                    boxShadow: tab === 0 ? '0 4px 12px rgba(0, 191, 255, 0.3)' : 'none',
                                    '&:hover': {
                                        bgcolor: tab === 0 ? '#00bfff' : 'rgba(179, 234, 255, 0.1)',
                                    }
                                }}
                            />
                            <Tab
                                icon={<PersonAddIcon sx={{ fontSize: 18 }} />}
                                iconPosition="start"
                                label="Sign Up"
                                {...a11yProps(1)}
                                sx={{
                                    color: tab === 1 ? '#0d1b2a' : '#b3eaff',
                                    bgcolor: tab === 1 ? '#00bfff' : 'transparent',
                                    boxShadow: tab === 1 ? '0 4px 12px rgba(0, 191, 255, 0.3)' : 'none',
                                    '&:hover': {
                                        bgcolor: tab === 1 ? '#00bfff' : 'rgba(179, 234, 255, 0.1)',
                                    }
                                }}
                            />
                        </Tabs>
                    </Box>

                    {/* Form Content */}
                    <Box
                        sx={{
                            p: 3,
                            pt: 0,
                        }}
                    >
                        {/* Login Form */}
                        {tab === 0 && (
                            <>
                                <Slide direction="right" in={tab === 0} mountOnEnter unmountOnExit timeout={300}>
                                    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {loginError && (
                                            <Alert
                                                severity="error"
                                                sx={{
                                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                                    color: '#ff5252',
                                                    border: '1px solid rgba(244, 67, 54, 0.3)',
                                                    borderRadius: 2,
                                                    '& .MuiAlert-icon': { color: '#ff5252' }
                                                }}
                                            >
                                                {loginError}
                                            </Alert>
                                        )}

                                        <TextField
                                            label="Email Address"
                                            type="email"
                                            variant="outlined"
                                            value={loginEmail}
                                            onChange={e => setLoginEmail(e.target.value)}
                                            fullWidth
                                            required
                                            disabled={loading}
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

                                        <TextField
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            variant="outlined"
                                            value={loginPassword}
                                            onChange={e => setLoginPassword(e.target.value)}
                                            fullWidth
                                            required
                                            disabled={loading}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon sx={{ color: '#b3eaff', fontSize: 20 }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                            sx={{ color: '#b3eaff' }}
                                                        >
                                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
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

                                        {/* Forgot Password Link */}
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                                            <Button
                                                variant="text"
                                                onClick={handleForgotPassword}
                                                disabled={loading}
                                                sx={{
                                                    color: '#b3eaff',
                                                    textTransform: 'none',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    padding: '4px 8px',
                                                    borderRadius: 1,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        color: '#00bfff',
                                                        backgroundColor: 'rgba(179, 234, 255, 0.05)',
                                                    },
                                                    '&:disabled': {
                                                        color: 'rgba(179, 234, 255, 0.5)',
                                                    }
                                                }}
                                            >
                                                Forgot Password?
                                            </Button>
                                        </Box>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading}
                                            size="large"
                                            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#0d1b2a' }} /> : <LoginIcon />}
                                            sx={{
                                                background: 'linear-gradient(45deg, #00bfff 30%, #40c4ff 90%)',
                                                color: '#0d1b2a',
                                                borderRadius: 2,
                                                py: 1.5,
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                textTransform: 'none',
                                                boxShadow: '0 6px 20px rgba(0, 191, 255, 0.3)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #0099cc 30%, #33b5e5 90%)',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 8px 25px rgba(0, 191, 255, 0.4)',
                                                },
                                                '&:disabled': {
                                                    background: 'linear-gradient(45deg, #666 30%, #888 90%)',
                                                    color: '#ccc',
                                                    transform: 'none',
                                                    boxShadow: 'none',
                                                }
                                            }}
                                        >
                                            {loading ? 'Signing In...' : 'Sign In'}
                                        </Button>

                                        {/* sign in with socials option */}
                                        <SocialLoginButtons
                                            onSocialLogin={handleSocialLogin}
                                            loading={loading}
                                        />

                                    </Box>
                                </Slide>

                                {/*open the forgot password modal when necessary*/}
                                <ForgotPasswordModal
                                    open={forgotPasswordOpen}
                                    onClose={() => setForgotPasswordOpen(false)}
                                    initialEmail={loginEmail}
                                />
                            </>
                        )}

                        {/* Signup Form */}
                        {tab === 1 && (
                            <Slide direction="left" in={tab === 1} mountOnEnter unmountOnExit timeout={300}>
                                <Box component="form" onSubmit={handleSignup} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {signupError && (
                                        <Alert
                                            severity="error"
                                            sx={{
                                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                                color: '#ff5252',
                                                border: '1px solid rgba(244, 67, 54, 0.3)',
                                                borderRadius: 2,
                                                '& .MuiAlert-icon': { color: '#ff5252' }
                                            }}
                                        >
                                            {signupError}
                                        </Alert>
                                    )}

                                    <TextField
                                        label="Full Name"
                                        variant="outlined"
                                        value={signupFullName}
                                        onChange={e => setSignupFullName(e.target.value)}
                                        fullWidth
                                        required
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: '#b3eaff', fontSize: 20 }} />
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

                                    <TextField
                                        label="Email Address"
                                        type="email"
                                        variant="outlined"
                                        value={signupEmail}
                                        onChange={e => setSignupEmail(e.target.value)}
                                        fullWidth
                                        required
                                        disabled={loading}
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

                                    <TextField
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        value={signupPassword}
                                        onChange={e => setSignupPassword(e.target.value)}
                                        fullWidth
                                        required
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: '#b3eaff', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: '#b3eaff' }}
                                                    >
                                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
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

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        size="large"
                                        startIcon={loading ? <CircularProgress size={20} sx={{ color: '#0d1b2a' }} /> : <PersonAddIcon />}
                                        sx={{
                                            background: 'linear-gradient(45deg, #00bfff 30%, #40c4ff 90%)',
                                            color: '#0d1b2a',
                                            borderRadius: 2,
                                            py: 1.5,
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            boxShadow: '0 6px 20px rgba(0, 191, 255, 0.3)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #0099cc 30%, #33b5e5 90%)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 8px 25px rgba(0, 191, 255, 0.4)',
                                            },
                                            '&:disabled': {
                                                background: 'linear-gradient(45deg, #666 30%, #888 90%)',
                                                color: '#ccc',
                                                transform: 'none',
                                                boxShadow: 'none',
                                            }
                                        }}
                                    >
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </Button>

                                    {/* sign in with socials option */}
                                    <SocialLoginButtons
                                        onSocialLogin={handleSocialLogin}
                                        loading={loading}
                                    />
                                </Box>
                            </Slide>
                        )}
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}