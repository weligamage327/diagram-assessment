import type { User as FirebaseUser } from 'firebase/auth';

// User roles
export type UserRole = 'editor' | 'viewer';

// Auth context type
export interface AuthContextType {
    user: FirebaseUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}
