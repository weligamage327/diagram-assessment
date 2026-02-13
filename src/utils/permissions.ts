import type { UserProfile, Diagram } from '../types';

/**
 * Determines if the current user has edit permissions for the given diagram.
 * 
 * Logic:
 * 1. Owner always has edit access.
 * 2. If shared with 'edit' access -> true.
 * 3. Otherwise -> false.
 * 
 * Note: This overrides the global 'viewer' role for specific diagrams.
 */
export const canEditDiagram = (user: UserProfile | null, diagram: Diagram | null): boolean => {
    if (!user || !diagram) return false;

    // 1. Check if user is shared as an editor (always allows edit)
    const sharedWithUser = diagram.sharedWith?.find(s => s.email === user.email);
    if (sharedWithUser?.access === 'edit') return true;

    // 2. Owner checks
    if (diagram.ownerId === user.uid) {
        // If owner is an editor -> true
        if (user.role === 'editor') return true;

        // If owner is a viewer -> true ONLY if they've shared it with at least one editor
        // (This allows them to "demo" the editor behavior if they have set up collaborators)
        const hasEditorCollab = diagram.sharedWith?.some(s => s.access === 'edit');
        if (hasEditorCollab) return true;
    }

    return false;
};
