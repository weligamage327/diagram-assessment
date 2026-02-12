import { useState, useEffect, type ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { AuthContext } from '../hooks/useAuth';
import type { UserProfile, UserRole } from '../types';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        let unsubscribeSnapshot: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            // Cleanup previous snapshot listener if user changes
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
                unsubscribeSnapshot = null;
            }

            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);

                try {
                    // Check existence once to handle creation if needed
                    const userDocSnap = await getDoc(userDocRef);

                    if (!userDocSnap.exists()) {
                        // Create new user profile if it doesn't exist
                        const newUserProfile: UserProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            role: 'viewer', // Default role
                            createdAt: new Date(),
                        };

                        await setDoc(userDocRef, {
                            email: newUserProfile.email,
                            role: newUserProfile.role,
                            createdAt: newUserProfile.createdAt,
                        });
                        // The snapshot listener below will pick up this new doc
                    }

                    // Set up real-time listener
                    unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setUserProfile({
                                uid: docSnap.id,
                                email: data.email,
                                role: data.role as UserRole,
                                createdAt: data.createdAt?.toDate() || new Date(),
                            });
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error("Error in user snapshot listener:", error);
                        setLoading(false);
                    });

                } catch (error) {
                    console.error("Error initializing user profile:", error);
                    setLoading(false);
                }
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        // Cleanup on unmount
        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
            }
        };
    }, []);

    const signIn = async (email: string, password: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string): Promise<void> => {
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = async (): Promise<void> => {
        await signOut(auth);
        setUserProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
