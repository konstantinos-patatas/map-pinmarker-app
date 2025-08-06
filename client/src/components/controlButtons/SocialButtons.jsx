import React from 'react';
import { Box, Button, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
// import FacebookIcon from '@mui/icons-material/Facebook';
// import AppleIcon from '@mui/icons-material/Apple';

const SocialLoginButtons = ({ onSocialLogin, loading = false, sx = {} }) => {
    return (
        <Box sx={{ ...sx }}>
            <Divider sx={{
                my: 2,
                color: 'rgba(179, 234, 255, 0.5)',
                '&::before, &::after': {
                    borderColor: 'rgba(179, 234, 255, 0.2)',
                }
            }}>
                OR
            </Divider>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={() => onSocialLogin('google')}
                    disabled={loading}
                    sx={{
                        color: '#e0e1dd',
                        borderColor: 'rgba(179, 234, 255, 0.3)',
                        borderRadius:20,
                        '&:hover': {
                            borderColor: '#00bfff',
                            bgcolor: 'rgba(179, 234, 255, 0.05)',
                        },
                    }}
                >
                    Continue with Google
                </Button>

                {/*<Button*/}
                {/*    fullWidth*/}
                {/*    variant="outlined"*/}
                {/*    startIcon={<FacebookIcon />}*/}
                {/*    onClick={() => onSocialLogin('facebook')}*/}
                {/*    disabled={loading}*/}
                {/*    sx={{*/}
                {/*        color: '#e0e1dd',*/}
                {/*        borderColor: 'rgba(179, 234, 255, 0.3)',*/}
                {/*        borderRadius:20,*/}
                {/*        '&:hover': {*/}
                {/*            borderColor: '#00bfff',*/}
                {/*            bgcolor: 'rgba(179, 234, 255, 0.05)',*/}
                {/*        },*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Continue with Facebook*/}
                {/*</Button>*/}

                {/*<Button*/}
                {/*    fullWidth*/}
                {/*    variant="outlined"*/}
                {/*    startIcon={<AppleIcon />}*/}
                {/*    onClick={() => onSocialLogin('apple')}*/}
                {/*    disabled={loading}*/}
                {/*    sx={{*/}
                {/*        color: '#e0e1dd',*/}
                {/*        borderColor: 'rgba(179, 234, 255, 0.3)',*/}
                {/*        borderRadius:20,*/}
                {/*        '&:hover': {*/}
                {/*            borderColor: '#00bfff',*/}
                {/*            bgcolor: 'rgba(179, 234, 255, 0.05)',*/}
                {/*        },*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Continue with Apple*/}
                {/*</Button>*/}
            </Box>
        </Box>
    );
};

export default SocialLoginButtons;