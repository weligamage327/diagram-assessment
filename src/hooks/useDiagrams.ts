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
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                data,
                nodeCount: data.nodes.length
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
                // TODO: Check permissions here (Editor/Viewer/Owner)

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
            setError('Failed to fetch diagram');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserDiagrams = useCallback(async (): Promise<Diagram[]> => {
        if (!user) return [];
        setLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, 'diagrams'),
                where('ownerId', '==', user.uid),
                orderBy('updatedAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
                } as Diagram;
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
            await deleteDoc(doc(db, 'diagrams', id));
        } catch (err) {
            console.error('Error deleting diagram:', err);
            setError('Failed to delete diagram');
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
        loading,
        error
    };
};
