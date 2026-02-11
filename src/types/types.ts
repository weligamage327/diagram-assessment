import type { User as FirebaseUser } from 'firebase/auth';

// User roles
export type UserRole = 'editor' | 'viewer';

// Auth context type
export interface AuthContextType {
    user: FirebaseUser | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
    createdAt: Date;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Diagram types
export interface DiagramNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: { label: string };
    [key: string]: any;
}

export interface DiagramEdge {
    id: string;
    source: string;
    target: string;
    [key: string]: any;
}

export interface DiagramData {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    viewport: { x: number; y: number; zoom: number };
}

export interface Diagram {
    id: string;
    name: string;
    ownerId: string;
    updatedAt: Date;
    createdAt: Date;
    data: DiagramData;
    nodeCount: number;
}
