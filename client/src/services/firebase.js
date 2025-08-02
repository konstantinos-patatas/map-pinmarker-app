import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDM-OT3Zy9UbJivMMGW74OgBsHy90oTC98",
    authDomain: "parknfree.firebaseapp.com",
    projectId: "parknfree",
    storageBucket: "parknfree.firebasestorage.app",
    messagingSenderId: "42975518122",
    appId: "1:42975518122:web:ff7909a489b0ff21ed1fd3",
    measurementId: "G-KC25Z317FG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
