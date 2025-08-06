// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Auth Providers
export const googleProvider = new GoogleAuthProvider();
// export const facebookProvider = new FacebookAuthProvider();
// export const appleProvider = new OAuthProvider('apple.com');

// Configure providers if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

// facebookProvider.addScope('email');
// facebookProvider.addScope('public_profile');
