import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../services/firebase';
import type { AuthContextType } from '../types/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async (): Promise<void> => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
