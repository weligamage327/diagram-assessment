import type { User as FirebaseUser } from 'firebase/auth';
import type { Node, Edge } from '@xyflow/react';

// User roles
export type UserRole = 'editor' | 'viewer';

// Auth context type
export interface AuthContextType {
    user: FirebaseUser | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
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
export type AppNodeData = {
    label: string;
    color?: string;
    [key: string]: unknown;
};

export type AppNode = Node<AppNodeData>;
export type AppEdge = Edge;

export interface DiagramData {
    nodes: AppNode[];
    edges: AppEdge[];
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
