import { useState, useCallback } from 'react';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    or,
    arrayUnion,
    serverTimestamp,
    orderBy,
    deleteDoc,
    type Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import type { Diagram, DiagramData } from '../types';

export const useDiagrams = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createDiagram = useCallback(async (name: string, data: DiagramData) => {
        if (!user) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            const docRef = await addDoc(collection(db, 'diagrams'), {
                name,
                ownerId: user.uid,
                ownerEmail: user.email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                data,
                nodeCount: data.nodes.length,
            });
            return docRef.id;
        } catch (err) {
            console.error('Error creating diagram:', err);
            setError('Failed to create diagram');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateDiagram = useCallback(async (id: string, name: string, data: DiagramData) => {
        if (!user) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, 'diagrams', id);
            await updateDoc(docRef, {
                name,
                data,
                nodeCount: data.nodes.length,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error('Error updating diagram:', err);
            setError('Failed to update diagram');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getDiagram = useCallback(async (id: string): Promise<Diagram | null> => {
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, 'diagrams', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Permission Check: Owner OR Shared
                const isOwner = data.ownerId === user?.uid;
                const isShared = data.sharedEmails?.includes(user?.email);

                if (!isOwner && !isShared) {
                    throw new Error('Permission denied: You do not have access to this diagram');
                }

                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
                } as Diagram;
            }
            return null;
        } catch (err) {
            console.error('Error fetching diagram:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch diagram');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getUserDiagrams = useCallback(async (): Promise<Diagram[]> => {
        if (!user) return [];
        setLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, 'diagrams'),
                or(
                    where('ownerId', '==', user.uid),
                    where('sharedEmails', 'array-contains', user.email)
                ),
                orderBy('updatedAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            // First pass: map docs to diagrams
            const initialDiagrams = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
                } as Diagram;
            });

            // Second pass: identify missing owner emails for shared diagrams
            const missingOwnerIds = new Set<string>();
            initialDiagrams.forEach(d => {
                if (d.ownerId !== user.uid && !d.ownerEmail) {
                    missingOwnerIds.add(d.ownerId);
                }
            });

            console.log('Missing owner IDs:', Array.from(missingOwnerIds));

            // Fetch missing user profiles
            const ownerEmailMap = new Map<string, string>();
            if (missingOwnerIds.size > 0) {
                await Promise.all(Array.from(missingOwnerIds).map(async (ownerId) => {
                    try {
                        console.log(`Fetching profile for ${ownerId}...`);
                        const userDoc = await getDoc(doc(db, 'users', ownerId));
                        if (userDoc.exists()) {
                            const email = userDoc.data().email;
                            console.log(`Fetched email for ${ownerId}: ${email}`);
                            ownerEmailMap.set(ownerId, email);
                        } else {
                            console.warn(`User profile not found for ${ownerId}`);
                        }
                    } catch (e) {
                        console.error(`Failed to fetch user profile for ${ownerId}`, e);
                    }
                }));
            }

            // Final pass: attach fetched emails
            return initialDiagrams.map(d => {
                if (d.ownerId !== user.uid && !d.ownerEmail && ownerEmailMap.has(d.ownerId)) {
                    return { ...d, ownerEmail: ownerEmailMap.get(d.ownerId) };
                }
                return d;
            });

        } catch (err) {
            console.error('Error fetching diagrams:', err);
            setError('Failed to fetch diagrams');
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    const deleteDiagram = useCallback(async (id: string) => {
        if (!user) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            // Check ownership before deleting
            const docRef = doc(db, 'diagrams', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.ownerId !== user.uid) {
                    throw new Error('Permission denied: Only the owner can delete this diagram');
                }
                await deleteDoc(docRef);
            }
        } catch (err) {
            console.error('Error deleting diagram:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete diagram');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const shareDiagram = useCallback(async (id: string, email: string, access: 'view' | 'edit') => {
        if (!user) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            // Check ownership before sharing
            const docRef = doc(db, 'diagrams', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.ownerId !== user.uid) {
                    throw new Error('Permission denied: Only the owner can share this diagram');
                }

                await updateDoc(docRef, {
                    sharedWith: arrayUnion({ email, access }),
                    sharedEmails: arrayUnion(email),
                    updatedAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error('Error sharing diagram:', err);
            setError(err instanceof Error ? err.message : 'Failed to share diagram');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    return {
        createDiagram,
        updateDiagram,
        getDiagram,
        getUserDiagrams,
        deleteDiagram,
        shareDiagram,
        loading,
        error
    };
};
