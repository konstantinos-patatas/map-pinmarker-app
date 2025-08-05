import React, {useEffect, useRef, useState} from 'react';
import {
    Modal,
    Box,
    TextField,
    Typography,
    Button,
    CircularProgress,
    IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import emailjs from 'emailjs-com';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    bgcolor: 'transparent',
    border: 'none',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
    outline: 'none'
};

const innerBoxStyle = {
    borderRadius: '1.5rem',
    background: 'linear-gradient(145deg, #1a1b2e 0%, #2a2e45 100%)',
    padding: '2.5rem',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    maxHeight: '90vh',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    touchAction: 'none',
};

const inputStyle = {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255, 255, 255, 0.4)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.light'
    }
};

const labelStyle = {
    color: 'grey.300',
    '&.Mui-focused': { color: 'primary.light' }
};

export default function EmailForm({ open, onClose }) {
    const form = useRef();
    const [errors, setErrors] = useState({});
    const [buttonText, setButtonText] = useState('Submit');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (data) => {
        const errors = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.user_email))
            errors.user_email = 'Enter a valid email';
        if (!data.user_name || data.user_name.trim().length < 2)
            errors.user_name = 'Name must be at least 2 characters';
        if (!data.subject || data.subject.trim().length < 3)
            errors.subject = 'Subject must be at least 3 characters';
        if (!data.message || data.message.trim().length < 10)
            errors.message = 'Message must be at least 10 characters';
        else if (data.message.length > 1000)
            errors.message = 'Message must be less than 1000 characters';

        const spamRegex = /\b(viagra|casino|lottery|winner.*money|click.*here.*now)\b/i;
        if (spamRegex.test(data.message + ' ' + data.subject))
            errors.message = 'Message contains prohibited content';

        return errors;
    };

    const sendEmail = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrors({});
        const formData = new FormData(form.current);

        const data = {
            user_name: formData.get('user_name'),
            user_email: formData.get('user_email'),
            subject: formData.get('subject'),
            message: formData.get('message')
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
                'service_pvvjbi9',
                'template_1zzgn9l',
                form.current,
                '_QhO2m6BVWb6xXr8G'
            );

            setButtonText('Sent ✓');
            form.current.reset();

            setTimeout(() => {
                setButtonText('Submit');
                setIsSubmitting(false);
                onClose();
            }, 2500);
        } catch (err) {
            console.error(err);
            setErrors({ general: 'Failed to send. Please try again later.' });
            setButtonText('Failed ✗');
            setTimeout(() => {
                setButtonText('Submit');
                setIsSubmitting(false);
            }, 2500);
        }
    };

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'; // prevent background scroll
        } else {
            document.body.style.overflow = 'unset';  // restore when modal closes
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    return (
        <Modal
            open={open}
           onClose={onClose}
           disableEscapeKeyDown
           disableAutoFocus
           disableEnforceFocus
           hideBackdrop={false}
        >
            <Box sx={modalStyle}>
                <Box component="form" ref={form} onSubmit={sendEmail} sx={innerBoxStyle}>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            color: 'grey.400',
                            '&:hover': { color: 'white' }
                        }}
                    >
                        <Close />
                    </IconButton>

                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Report an Issue
                    </Typography>

                    {errors.general && (
                        <Typography variant="body2" sx={{ color: 'error.light' }}>
                            {errors.general}
                        </Typography>
                    )}

                    <TextField
                        name="user_name"
                        label="Your Name"
                        fullWidth
                        required
                        variant="outlined"
                        InputProps={{ sx: inputStyle }}
                        InputLabelProps={{ sx: labelStyle }}
                        error={!!errors.user_name}
                        helperText={errors.user_name}
                    />

                    <TextField
                        name="user_email"
                        label="Your Email"
                        fullWidth
                        required
                        variant="outlined"
                        InputProps={{ sx: inputStyle }}
                        InputLabelProps={{ sx: labelStyle }}
                        error={!!errors.user_email}
                        helperText={errors.user_email}
                    />

                    <TextField
                        name="subject"
                        label="Subject"
                        fullWidth
                        required
                        variant="outlined"
                        InputProps={{ sx: inputStyle }}
                        InputLabelProps={{ sx: labelStyle }}
                        error={!!errors.subject}
                        helperText={errors.subject}
                    />

                    <TextField
                        name="message"
                        label="Message"
                        multiline
                        minRows={4}
                        fullWidth
                        required
                        variant="outlined"
                        InputProps={{ sx: inputStyle }}
                        InputLabelProps={{ sx: labelStyle }}
                        error={!!errors.message}
                        helperText={errors.message}
                    />

                    <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        disabled={isSubmitting}
                        sx={{
                            mt: 2,
                            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                            color: 'white',
                            fontWeight: 'bold',
                            py: 1.5,
                            borderRadius: '8px',
                            '&:hover': {
                                background: 'linear-gradient(to right, #2563eb, #7c3aed)'
                            },
                            '&:disabled': {
                                background: 'grey.600',
                                color: 'grey.400'
                            }
                        }}
                    >
                        {isSubmitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : buttonText}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
