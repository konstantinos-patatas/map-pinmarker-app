import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Create context
const AuthContext = createContext();

// Export hook for easier access
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Listen to auth changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Load user profile from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data());
                    } else {
                        // Handle case where profile doesn't exist (shouldn't happen normally)
                        setUserProfile(null);
                    }
                } catch (error) {
                    console.error('Error loading user profile:', error);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }

            setAuthLoading(false);
        });

        return unsubscribe;
    }, []);

    // Login
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Sign up with full name
    const signup = async (email, password, fullName) => {
        try {
            // Create the user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user profile in Firestore
            const userProfile = {
                uid: user.uid,
                email: user.email,
                fullName: fullName.trim(),
                createdAt: new Date().toISOString(),
                verified: false // you can use this for verified users later
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);
            setUserProfile(userProfile);

            return userCredential;
        } catch (error) {
            console.error('Error during signup:', error);
            throw error;
        }
    };

    // Logout
    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userProfile,
        login,
        signup,
        logout,
        authLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!authLoading && children}
        </AuthContext.Provider>
    );
};