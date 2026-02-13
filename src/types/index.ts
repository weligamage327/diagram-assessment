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
    isReadOnly?: boolean;
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
    ownerEmail?: string;
    updatedAt: Date;
    createdAt: Date;
    data: DiagramData;
    nodeCount: number;
    sharedWith?: { email: string; access: 'view' | 'edit' }[];
    sharedEmails?: string[];
}

export interface DiagramCardProps {
    diagram: Diagram;
    currentUserId?: string;
    currentUserEmail?: string | null;
    onOpen: (id: string) => void;
    onDelete: (id: string, name: string) => void;
    onShare: (id: string, name: string) => void;
}

export interface ShareDiagramModalProps {
    isOpen: boolean;
    onClose: () => void;
    diagramName: string;
    onShare: (email: string, role: 'view' | 'edit') => Promise<void>;
}

export interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    isDeleting?: boolean;
}
