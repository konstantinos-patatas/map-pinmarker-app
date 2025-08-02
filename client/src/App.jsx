import './general.css';
import Home from './pages/Home.jsx';
import { useEffect } from 'react';
import { setAppHeight } from './utils/setAppHeight';

function App() {
    useEffect(() => {
        setAppHeight();
    }, []);

    return <Home />;
}

export default App;
