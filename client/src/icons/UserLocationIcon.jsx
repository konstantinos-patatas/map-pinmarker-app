import L from 'leaflet';

// custom blue circle icon for user location
const UserLocationIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div style="
    background: #3b82f6; 
    width: 20px; 
    height: 20px; 
    border-radius: 50%; 
    border: 3px solid white; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

export default UserLocationIcon;