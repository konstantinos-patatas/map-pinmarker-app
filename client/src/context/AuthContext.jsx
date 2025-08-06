import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

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
                        // Create profile for social login users if it doesn't exist
                        const userProfile = {
                            uid: user.uid,
                            email: user.email,
                            fullName: user.displayName || 'User',
                            photoURL: user.photoURL || null,
                            createdAt: new Date().toISOString(),
                            verified: user.emailVerified,
                            authMethod: user.providerData[0]?.providerId || 'email'
                        };

                        await setDoc(doc(db, 'users', user.uid), userProfile);
                        setUserProfile(userProfile);
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

    // Email/Password Login
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Email/Password Sign up with full name
    const signup = async (email, password, fullName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userProfile = {
                uid: user.uid,
                email: user.email,
                fullName: fullName.trim(),
                photoURL: null,
                createdAt: new Date().toISOString(),
                verified: false,
                authMethod: 'email'
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);
            setUserProfile(userProfile);

            return userCredential;
        } catch (error) {
            console.error('Error during signup:', error);
            throw error;
        }
    };

    // Google Sign In
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // User profile will be created/updated in the onAuthStateChanged listener
            return result;
        } catch (error) {
            console.error('Error during Google sign in:', error);
            throw error;
        }
    };

    // Delete Account
    const deleteAccount = async () => {
        try {
            if (!currentUser) {
                throw new Error('No user is currently signed in');
            }

            const userId = currentUser.uid;

            // First delete the user document from Firestore
            await deleteDoc(doc(db, 'users', userId));

            // Then delete the user from Firebase Auth
            await deleteUser(currentUser);

            // Clear local state
            setCurrentUser(null);
            setUserProfile(null);

            return { success: true };
        } catch (error) {
            console.error('Error deleting account:', error);
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
        signInWithGoogle,
        deleteAccount,
        logout,
        authLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!authLoading && children}
        </AuthContext.Provider>
    );
};