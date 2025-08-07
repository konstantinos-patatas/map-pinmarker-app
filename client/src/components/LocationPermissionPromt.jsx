import React from 'react';

const LocationPermissionPrompt = ({
                                      open,
                                      onClose,
                                      onRetry,
                                      deviceInfo = {}
                                  }) => {
    if (!open) return null;

    const getBrowserName = () => {
        const ua = navigator.userAgent;

        if (/CriOS/i.test(ua)) return 'Chrome';
        if (/FxiOS/i.test(ua)) return 'Firefox';
        if (/EdgiOS/i.test(ua)) return 'Edge';
        if (/OPiOS/i.test(ua)) return 'Opera';
        if (/Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)) return 'Safari';
        return 'the Browser you are using';
    };


    const getDeviceSpecificInstructions = () => {
        if (deviceInfo.isIOS) {
            if (deviceInfo.isPWA) {
                return [
                    "Go to Settings → Privacy & Security → Location Services",
                    "Find this app and set it to 'While Using App'",
                    "Return here and tap 'Try Again' below"
                ];
            } else {
                return [
                    "Go to Settings → Privacy & Security → Location Services",
                    `Find '${getBrowserName()}' and set it to 'While Using App'`,
                    "Return here and tap 'Try Again' below"
                ];
            }
        } else if (deviceInfo.isAndroid) {
            return [
                "Tap 'Allow' when prompted for location access",
                "If not prompted, go to Settings → Apps → Browser → Permissions",
                "Enable Location permission and tap 'Try Again'"
            ];
        } else {
            return [
                "Click 'Allow' when your browser asks for location access",
                "If blocked, click the location icon in your address bar",
                "Set location permission to 'Allow' and try again"
            ];
        }
    };

    const instructions = getDeviceSpecificInstructions();

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
            animation: 'fadeIn 0.3s ease-out',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        modal: {
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '480px',
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            minHeight: 'auto',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            animation: 'slideUp 0.4s ease-out',
            marginTop: 'auto',
            marginBottom: '20px'
        },
        closeButton: {
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'all 0.2s ease'
        },
        header: {
            textAlign: 'center',
            marginBottom: '20px'
        },
        iconContainer: {
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            animation: 'pulse 2s ease-in-out infinite'
        },
        title: {
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: '0 0 8px 0',
            letterSpacing: '0.5px'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0
        },
        instructionsHeader: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            gap: '8px'
        },
        instructionsTitle: {
            color: 'white',
            fontWeight: '600',
            fontSize: '1.1rem',
            margin: 0
        },
        instructionsList: {
            paddingLeft: '8px'
        },
        instructionItem: {
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '12px',
            gap: '12px'
        },
        stepNumber: {
            minWidth: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'white',
            marginTop: '2px'
        },
        instructionText: {
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.5',
            fontSize: '0.95rem',
            margin: 0
        },
        tipBox: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        tipTitle: {
            color: '#4fc3f7',
            fontWeight: '600',
            marginBottom: '8px',
            fontSize: '0.9rem'
        },
        tipText: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            margin: 0
        },
        buttonContainer: {
            display: 'flex',
            gap: '16px',
            flexDirection: 'column'
        },
        primaryButton: {
            background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
            color: 'white',
            fontWeight: '600',
            textTransform: 'none',
            borderRadius: '16px',
            padding: '12px 24px',
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(79, 195, 247, 0.3)',
            transition: 'all 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        secondaryButton: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: '500',
            textTransform: 'none',
            background: 'transparent',
            border: 'none',
            padding: '12px 24px',
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: '16px',
            transition: 'all 0.2s ease'
        }
    };

    const LocationIcon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    );

    const SettingsIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#4fc3f7">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
    );

    const RefreshIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4c-4.42,0 -7.99,3.58 -7.99,8s3.57,8 7.99,8c3.73,0 6.84,-2.55 7.73,-6h-2.08c-0.82,2.33 -3.04,4 -5.65,4 -3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6c1.66,0 3.14,0.69 4.22,1.78L13,11h7V4L17.65,6.35z"/>
        </svg>
    );

    const CloseIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
    );

    return (
        <>
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0; 
              transform: translateY(30px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(79, 195, 247, 0.4);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 0 0 10px rgba(79, 195, 247, 0);
            }
          }
          
          .close-button:hover {
            color: white !important;
            background: rgba(255, 255, 255, 0.2) !important;
          }
          
          .primary-button:hover {
            background: linear-gradient(135deg, #29b6f6 0%, #1976d2 100%) !important;
            box-shadow: 0 6px 20px rgba(79, 195, 247, 0.4) !important;
            transform: translateY(-1px) !important;
          }
          
          .secondary-button:hover {
            color: white !important;
            background: rgba(255, 255, 255, 0.05) !important;
          }
        `}
            </style>

            <div style={styles.overlay}>
                <div style={styles.modal}>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={styles.closeButton}
                        className="close-button"
                    >
                        <CloseIcon />
                    </button>

                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.iconContainer}>
                            <LocationIcon />
                        </div>

                        <h2 style={styles.title}>
                            Location Access Blocked
                        </h2>

                        <p style={styles.subtitle}>
                            We need your location to show nearby pins and provide the best experience
                        </p>
                    </div>

                    {/* Instructions */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={styles.instructionsHeader}>
                            <SettingsIcon />
                            <h3 style={styles.instructionsTitle}>
                                How to Enable Location:
                            </h3>
                        </div>

                        <div style={styles.instructionsList}>
                            {instructions.map((instruction, index) => (
                                <div key={index} style={styles.instructionItem}>
                                    <div style={styles.stepNumber}>
                                        {index + 1}
                                    </div>
                                    <p style={styles.instructionText}>
                                        {instruction}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional tips */}
                    <div style={styles.tipBox}>
                        <div style={styles.tipTitle}>
                            💡 Pro Tips:
                        </div>
                        <p style={styles.tipText}>
                            {deviceInfo.isIOS && !deviceInfo.isPWA ? (
                                "Add this app to your home screen, Press share -> add to home screen"
                            ) : deviceInfo.isAndroid ? (
                                "Use Chrome or Firefox for the best location accuracy and performance."
                            ) : (
                                "For the best experience, use a modern browser like Chrome, Safari, or Firefox."
                            )}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.buttonContainer}>
                        <button
                            onClick={onRetry}
                            style={styles.primaryButton}
                            className="primary-button"
                        >
                            <RefreshIcon />
                            Try Again
                        </button>

                        <button
                            onClick={onClose}
                            style={styles.secondaryButton}
                            className="secondary-button"
                        >
                            Continue Without Location
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LocationPermissionPrompt;