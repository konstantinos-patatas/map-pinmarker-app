/**
 * Get full address from coordinates (alternative with more details)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} - Address object with components
 */
export const getFullAddressFromCoordinates = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'parknfree/1.0' // Required by Nominatim
                }
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }

        const data = await response.json();
        const address = data.address || {};

        // Create display name for pin
        const displayName = getDisplayNameFromAddress(address);

        return {
            displayName,
            fullAddress: address,
            rawData: data
        };

    } catch (error) {
        console.error('Error getting location data:', error);
        return {
            displayName: `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            fullAddress: {},
            rawData: null
        };
    }
};

/**
 * Generate display name following industry standards (Google Maps/Waze style)
 * @param {object} address - Address object from geocoding API
 * @returns {string} - Formatted display name
 */
export const getDisplayNameFromAddress = (address) => {
    const road = address.road || address.pedestrian || address.footway || '';
    const houseNumber = address.house_number || '';
    const municipality = address.city || address.town || address.county || '';
    const neighborhood = address.quarter || address.neighbourhood || address.suburb || '';


    // INDUSTRY STANDARD PATTERN 2: Street Name + Municipality (most common)
    if (road && municipality) {
        return `${road}, ${municipality}`;
    }

    // PATTERN 3: Street Name + Neighborhood (local context)
    if (road && neighborhood) {
        return `${road}, ${neighborhood}`;
    }

    // PATTERN 4: Just Street Name (clean)
    if (road) {
        return road;
    }

    // PATTERN 5: Area-based fallback
    if (neighborhood) {
        return `Near ${neighborhood}`;
    }

    if (municipality) {
        return `Near ${municipality}`;
    }

    // Final fallback
    return 'Free Parking Spot';
};
