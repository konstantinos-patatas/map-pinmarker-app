import L from 'leaflet';

const HeartIcon = () =>
    L.divIcon({
        className: 'favorite-marker',
        html: `
    <div style="
      position: relative;
      background: red;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 18px;
        text-shadow: 0 0 2px black;
      ">
        ❤
      </div>
    </div>
  `,
        iconSize: [36, 36],
        iconAnchor: [18, 36], // Anchor the point of the pin
    });

export default HeartIcon;
