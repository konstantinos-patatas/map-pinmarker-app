/**
 * Location utilities for better cross-platform compatibility
 */

// Device detection
export const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    return {
        isIOS: /iPad|iPhone|iPod/.test(userAgent),
        isAndroid: /Android/.test(userAgent),
        isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
        isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
        isFirefox: /Firefox/.test(userAgent),
        isPWA: window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true,
        supportsGeolocation: 'geolocation' in navigator,
        supportsPermissionsAPI: 'permissions' in navigator
    };
};

// Promisified getCurrentPosition with better error handling
export const getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        };

        const finalOptions = { ...defaultOptions, ...options };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve(position);
            },
            (error) => {
                // Provide more specific error messages
                let errorMessage = 'Unable to get location';
                
                switch (error.code) {
                    case 1:
                        errorMessage = 'Location permission denied';
                        break;
                    case 2:
                        errorMessage = 'Location unavailable';
                        break;
                    case 3:
                        errorMessage = 'Location request timed out';
                        break;
                    default:
                        errorMessage = 'Unknown location error';
                }
                
                const enhancedError = new Error(errorMessage);
                enhancedError.code = error.code;
                enhancedError.originalError = error;
                reject(enhancedError);
            },
            finalOptions
        );
    });
};

// IP-based location detection with multiple fallback services
export const getLocationByIP = async () => {
    const services = [
        {
            name: 'ipapi.co',
            url: 'https://ipapi.co/json/',
            parser: (data) => ({ lat: data.latitude, lng: data.longitude })
        },
        {
            name: 'ip-api.com',
            url: 'https://ip-api.com/json/',
            parser: (data) => ({ lat: data.lat, lng: data.lon })
        },
        {
            name: 'ipgeolocation.io',
            url: 'https://api.ipgeolocation.io/ipgeo?apiKey=free',
            parser: (data) => ({ lat: data.latitude, lng: data.longitude })
        },
        {
            name: 'myip.com',
            url: 'https://api.myip.com',
            parser: (data) => ({ lat: data.lat, lng: data.lon })
        }
    ];

    for (const service of services) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(service.url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const coords = service.parser(data);
                
                if (coords.lat && coords.lng) {
                    return {
                        lat: parseFloat(coords.lat),
                        lng: parseFloat(coords.lng),
                        method: 'ip',
                        service: service.name
                    };
                }
            }
        } catch (error) {
            console.log(`Service ${service.name} failed:`, error);
            continue;
        }
    }

    throw new Error('All IP location services failed');
};

// Check location permission status
export const checkLocationPermission = async () => {
    if (!navigator.permissions) {
        return 'unknown';
    }

    try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
    } catch (error) {
        console.log('Permission check failed:', error);
        return 'unknown';
    }
};

// Get optimal location strategy for current device
export const getLocationStrategy = () => {
    const deviceInfo = getDeviceInfo();
    
    return {
        ...deviceInfo,
        requiresUserInteraction: deviceInfo.isIOS && deviceInfo.isSafari && !deviceInfo.isPWA,
        canAutoRequest: !deviceInfo.isIOS || deviceInfo.isPWA,
        recommendedTimeout: deviceInfo.isIOS ? 10000 : 15000,
        recommendedMaxAge: deviceInfo.isIOS ? 30000 : 60000
    };
};

// Enhanced location request with multiple fallback strategies
export const requestLocationWithFallback = async (options = {}) => {
    const deviceInfo = getDeviceInfo();
    const strategy = getLocationStrategy();
    
    try {
        // Strategy 1: Check permission first (if supported)
        if (deviceInfo.supportsPermissionsAPI) {
            const permission = await checkLocationPermission();
            if (permission === 'denied') {
                throw new Error('Location permission denied');
            }
        }

        // Strategy 2: Try GPS location
        const position = await getCurrentPosition({
            enableHighAccuracy: true,
            timeout: strategy.recommendedTimeout,
            maximumAge: strategy.recommendedMaxAge,
            ...options
        });

        return {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            method: 'gps',
            timestamp: position.timestamp
        };

    } catch (gpsError) {
        console.log('GPS location failed, trying IP-based location:', gpsError);
        
        // Strategy 3: Try IP-based location
        try {
            const ipLocation = await getLocationByIP();
            return {
                ...ipLocation,
                accuracy: null,
                timestamp: Date.now()
            };
        } catch (ipError) {
            console.log('IP location failed:', ipError);
            throw new Error('Unable to determine location');
        }
    }
};

// Format location accuracy for display
export const formatAccuracy = (accuracy) => {
    if (!accuracy) return 'Unknown';
    
    if (accuracy < 10) return 'High';
    if (accuracy < 50) return 'Medium';
    return 'Low';
};

// Get location method display name
export const getLocationMethodDisplay = (method) => {
    switch (method) {
        case 'gps':
            return 'GPS Location';
        case 'ip':
            return 'IP Location';
        case 'fallback':
            return 'Default Location';
        default:
            return 'Location Unknown';
    }
}; 