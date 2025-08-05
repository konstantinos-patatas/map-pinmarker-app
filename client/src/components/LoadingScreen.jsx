import React from 'react';

const LoadingScreen = ({ loading = true, pinsLoading = false }) => {
    const loadingStyles = {
        container: {
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '2rem',
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(25, 45, 65, 0.95) 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        backgroundBlob1: {
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 6s ease-in-out infinite'
        },
        backgroundBlob2: {
            position: 'absolute',
            bottom: '30%',
            right: '15%',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            animation: 'float 4s ease-in-out infinite reverse'
        },
        contentBox: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center',
            zIndex: 1,
            animation: 'fadeIn 0.8s ease-out'
        },
        spinnerContainer: {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        spinner: {
            width: '80px',
            height: '80px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid rgba(255,255,255,0.9)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        icon: {
            position: 'absolute',
            fontSize: '32px',
            color: 'white'
        },
        title: {
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '0 0 0.5rem 0',
            letterSpacing: '0.5px',
            animation: 'slideUp 0.6s ease-out 0.2s both'
        },
        subtitle: {
            color: 'rgba(255,255,255,0.85)',
            fontSize: '1rem',
            fontWeight: '400',
            maxWidth: '320px',
            lineHeight: '1.5',
            margin: 0,
            animation: 'slideUp 0.6s ease-out 0.4s both'
        },
        dotsContainer: {
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem'
        },
        dot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.6)'
        }
    };

    const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0%, 100% { 
        opacity: 0.3;
        transform: scale(1);
      }
      50% { 
        opacity: 1;
        transform: scale(1.2);
      }
    }
  `;

    const LocationIcon = () => (
        <svg style={loadingStyles.icon} viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    );

    const MapIcon = () => (
        <svg style={loadingStyles.icon} viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
        </svg>
    );

    return (
        <>
            <style>{keyframes}</style>
            <div style={loadingStyles.container}>
                <div style={loadingStyles.backgroundBlob1}></div>
                <div style={loadingStyles.backgroundBlob2}></div>

                <div style={loadingStyles.contentBox}>
                    <div style={loadingStyles.spinnerContainer}>
                        <div style={loadingStyles.spinner}></div>
                        {loading ? <LocationIcon /> : <MapIcon />}
                    </div>

                    <div>
                        <h2 style={loadingStyles.title}>
                            {loading && 'Locating You'}
                            {pinsLoading && 'Loading Map Data'}
                        </h2>

                        <p style={loadingStyles.subtitle}>
                            {loading && 'Please allow location access for the best experience'}
                            {pinsLoading && 'Preparing your personalized map experience'}
                        </p>
                    </div>

                    <div style={loadingStyles.dotsContainer}>
                        {[0, 1, 2].map((index) => (
                            <div
                                key={index}
                                style={{
                                    ...loadingStyles.dot,
                                    animation: `pulse 1.5s ease-in-out infinite ${index * 0.2}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoadingScreen;