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

    // 1. Owner check
    if (diagram.ownerId === user.uid) return true;

    // 2. Shared permission check
    const sharedWithUser = diagram.sharedWith?.find(s => s.email === user.email);
    if (sharedWithUser?.access === 'edit') return true;

    return false;
};
