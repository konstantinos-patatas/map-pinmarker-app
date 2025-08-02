export function setAppHeight() {
    const updateHeight = () => {
        const height = window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${height}px`);
    };

    updateHeight(); // Set on load

    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
}
