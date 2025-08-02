import L from 'leaflet';

//custom parking pins
const ParkingIcon = L.divIcon({
    className: 'user-pin-marker',
    html: `
    <div style="
      position: relative;
      background: #0033A0;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid yellow;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-weight: bold;
        font-size: 16px;
        text-shadow: 0 0 2px black;
      ">P</div>
    </div>
  `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

export default ParkingIcon;