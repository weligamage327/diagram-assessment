import { useState, useEffect, type ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { AuthContext } from '../hooks/useAuth';
import type { UserProfile, UserRole } from '../types/types';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // 1. Try fetching by UID (standard)
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserProfile({
                            uid: userDoc.id,
                            email: data.email,
                            role: data.role as UserRole,
                            createdAt: data.createdAt?.toDate() || new Date(),
                        });
                    } else {
                        // 2. Try fetching by Email (fallback for manual entries)
                        if (firebaseUser.email) {
                            const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
                            const querySnapshot = await getDocs(q);

                            if (!querySnapshot.empty) {
                                const userDoc = querySnapshot.docs[0];
                                const data = userDoc.data();
                                setUserProfile({
                                    uid: userDoc.id,
                                    email: data.email,
                                    role: data.role as UserRole,
                                    createdAt: data.createdAt?.toDate() || new Date(),
                                });
                            } else {
                                // Fallback default
                                setUserProfile({
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email || '',
                                    role: 'editor', // Default so I can test
                                    createdAt: new Date(),
                                });
                            }
                        } else {
                            // No email to query with
                            setUserProfile({
                                uid: firebaseUser.uid,
                                email: '',
                                role: 'editor',
                                createdAt: new Date(),
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    // Fallback
                    setUserProfile({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        role: 'editor',
                        createdAt: new Date(),
                    });
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async (): Promise<void> => {
        await signOut(auth);
        setUserProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, signIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
