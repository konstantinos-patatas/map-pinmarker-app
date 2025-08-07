import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Modal,
    Box,
    TextField,
    Typography,
    Button,
    CircularProgress,
    IconButton,
    Alert,
    InputAdornment,
    Fade,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Close as CloseIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Subject as SubjectIcon,
    Message as MessageIcon,
    Send as SendIcon,
    BugReport as BugReportIcon
} from '@mui/icons-material';
import emailjs from 'emailjs-com';

const modalStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
};

export default function EmailForm({ open, onClose }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const form = useRef();
    const [errors, setErrors] = useState({});
    const [buttonText, setButtonText] = useState('Send Report');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const validateForm = useCallback((data) => {
        const errors = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.user_email || !emailRegex.test(data.user_email.trim())) {
            errors.user_email = 'Please enter a valid email address';
        }

        // Name validation
        if (!data.user_name || data.user_name.trim().length < 2) {
            errors.user_name = 'Name must be at least 2 characters long';
        }

        // Subject validation
        if (!data.subject || data.subject.trim().length < 3) {
            errors.subject = 'Subject must be at least 3 characters long';
        } else if (data.subject.length > 100) {
            errors.subject = 'Subject must be less than 100 characters';
        }

        // Message validation
        if (!data.message || data.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters long';
        } else if (data.message.length > 2000) {
            errors.message = 'Message must be less than 2000 characters';
        }

        // Basic spam detection
        const spamRegex = /\b(viagra|casino|lottery|winner.*money|click.*here.*now|free.*money)\b/i;
        if (spamRegex.test(`${data.message} ${data.subject}`)) {
            errors.message = 'Message contains prohibited content';
        }

        return errors;
    }, []);

    const sendEmail = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrors({});
        setShowSuccess(false);

        const formData = new FormData(form.current);
        const data = {
            user_name: formData.get('user_name')?.trim() || '',
            user_email: formData.get('user_email')?.trim() || '',
            subject: formData.get('subject')?.trim() || '',
            message: formData.get('message')?.trim() || ''
        };

        const validationErrors = validateForm(data);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        setButtonText('Sending...');

        try {
            await emailjs.sendForm(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                form.current,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            setButtonText('Sent Successfully!');
            setShowSuccess(true);
            form.current.reset();

            setTimeout(() => {
                setButtonText('Send Report');
                setIsSubmitting(false);
                setShowSuccess(false);
                onClose();
            }, 2500);
        } catch (err) {
            console.error('Email sending failed:', err);
            setErrors({ general: 'Failed to send message. Please try again later.' });
            setButtonText('Try Again');
            setTimeout(() => {
                setButtonText('Send Report');
                setIsSubmitting(false);
            }, 3000);
        }
    };

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            onClose();
        }
    }, [isSubmitting, onClose]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    const innerBoxStyle = {
        position: 'relative',
        width: '100%',
        maxWidth: { xs: '95vw', sm: 500, md: 600 },
        maxHeight: { xs: '95vh', sm: '90vh' },
        bgcolor: 'rgba(13, 27, 42, 0.98)',
        borderRadius: 4,
        boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(179, 234, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(179, 234, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(179, 234, 255, 0.05) 100%)',
        p: { xs: 2, sm: 3 },
        borderBottom: '1px solid rgba(179, 234, 255, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1,
    };

    const contentStyle = {
        flex: 1,
        overflowY: 'auto',
        p: { xs: 2, sm: 3 },
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

    const textFieldStyle = {
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
            '&.Mui-error fieldset': {
                borderColor: '#ff5252',
            },
        },
        '& .MuiInputBase-input': {
            color: '#e0e1dd',
            fontSize: { xs: '0.9rem', sm: '1rem' },
        },
        '& .MuiInputLabel-root': {
            color: '#b3eaff',
            fontWeight: 500,
            '&.Mui-focused': {
                color: '#00bfff',
            },
            '&.Mui-error': {
                color: '#ff5252',
            },
        },
        '& .MuiFormHelperText-root': {
            color: '#ff5252',
            fontSize: '0.75rem',
            mt: 0.5,
        },
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            sx={modalStyle}
        >
            <Fade in={open} timeout={300}>
                <Box sx={innerBoxStyle}>
                    {/* Header */}
                    <Box sx={headerStyle}>
                        <IconButton
                            onClick={handleClose}
                            disabled={isSubmitting}
                            sx={{
                                position: 'absolute',
                                right: { xs: 8, sm: 12 },
                                top: { xs: 8, sm: 12 },
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 5 }}>
                            <BugReportIcon
                                sx={{
                                    color: '#00bfff',
                                    fontSize: { xs: 28, sm: 32 }
                                }}
                            />
                            <Box>
                                <Typography
                                    variant={isMobile ? "h5" : "h4"}
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(45deg, #00bfff, #b3eaff)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        mb: 0.5,
                                    }}
                                >
                                    Report an Issue
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(224, 225, 221, 0.8)',
                                        fontWeight: 400,
                                    }}
                                >
                                    Help us improve by reporting bugs or issues
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={contentStyle}>
                        <Box
                            component="form"
                            ref={form}
                            onSubmit={sendEmail}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: { xs: 2, sm: 3 }
                            }}
                        >
                            {errors.general && (
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
                                    {errors.general}
                                </Alert>
                            )}

                            {showSuccess && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                                        color: '#4caf50',
                                        border: '1px solid rgba(76, 175, 80, 0.3)',
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': { color: '#4caf50' }
                                    }}
                                >
                                    Your report has been sent successfully!
                                </Alert>
                            )}

                            <TextField
                                name="user_name"
                                label="Your Name"
                                fullWidth
                                required
                                disabled={isSubmitting}
                                variant="outlined"
                                error={!!errors.user_name}
                                helperText={errors.user_name}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ color: '#b3eaff', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />

                            <TextField
                                name="user_email"
                                label="Your Email"
                                type="email"
                                fullWidth
                                required
                                disabled={isSubmitting}
                                variant="outlined"
                                error={!!errors.user_email}
                                helperText={errors.user_email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: '#b3eaff', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />

                            <TextField
                                name="subject"
                                label="Subject"
                                fullWidth
                                required
                                disabled={isSubmitting}
                                variant="outlined"
                                error={!!errors.subject}
                                helperText={errors.subject}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SubjectIcon sx={{ color: '#b3eaff', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />

                            <TextField
                                name="message"
                                label="Describe the issue"
                                multiline
                                minRows={isMobile ? 3 : 4}
                                maxRows={isMobile ? 6 : 8}
                                fullWidth
                                required
                                disabled={isSubmitting}
                                variant="outlined"
                                error={!!errors.message}
                                helperText={errors.message || `${form.current?.message?.value?.length || 0}/2000 characters`}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                            <MessageIcon sx={{ color: '#b3eaff', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                                placeholder="Please provide detailed information about the issue you encountered..."
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={isSubmitting}
                                size="large"
                                startIcon={
                                    isSubmitting ?
                                        <CircularProgress size={20} sx={{ color: '#0d1b2a' }} /> :
                                        <SendIcon />
                                }
                                sx={{
                                    background: 'linear-gradient(45deg, #00bfff 30%, #40c4ff 90%)',
                                    color: '#0d1b2a',
                                    borderRadius: 2,
                                    py: { xs: 1.2, sm: 1.5 },
                                    fontWeight: 600,
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
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
                                {buttonText}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}