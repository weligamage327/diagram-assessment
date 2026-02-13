import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type OnConnect,
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from '../../hooks/useTheme';
import { useDiagrams } from '../../hooks/useDiagrams';
import { useAuth } from '../../hooks/useAuth';
import type { DiagramData, AppNode, AppEdge, Diagram } from '../../types';
import { canEditDiagram } from '../../utils/permissions';
import { ArrowLeft, Save, Sun, Moon, Plus, Trash2, Loader2 } from 'lucide-react';
import './DiagramEditor.css';

import { BaseNode } from './components/BaseNode';
import { initialNodes, initialEdges } from '../../constants/initialElements'

const nodeTypes = {
    default: BaseNode,
    input: BaseNode,
    output: BaseNode,
};

const DiagramEditorContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const { theme, toggleTheme } = useTheme();
    const { createDiagram, updateDiagram, getDiagram, loading: dbLoading } = useDiagrams();
    const { userProfile } = useAuth();
    const { getViewport } = useReactFlow();

    const [diagram, setDiagram] = useState<Diagram | null>(null);

    // Determine effective permission
    // If no ID (creating new), allow edit.
    // If ID exists but diagram not loaded yet, default to read-only for safety.
    const isReadOnly = useMemo(() => {
        if (!id) return false; // Creating new diagram
        if (!diagram) return true; // Still loading or not found
        return !canEditDiagram(userProfile, diagram);
    }, [id, diagram, userProfile]);

    const [diagramName, setDiagramName] = useState(id ? 'Untitled Diagram' : 'New Diagram');
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(
        JSON.stringify({ nodes: initialNodes, edges: initialEdges, name: id ? 'Untitled Diagram' : 'New Diagram' })
    );

    // Check for save message from navigation
    useEffect(() => {
        if (location.state?.saved) {
            setSaveMessage('Diagram saved successfully!');
            setTimeout(() => setSaveMessage(null), 3000);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Load diagram
    useEffect(() => {
        if (!id) return;

        const loadDiagram = async () => {
            setIsLoading(true);
            try {
                const loadedDiagram = await getDiagram(id);
                if (loadedDiagram) {
                    setDiagram(loadedDiagram);
                    setDiagramName(loadedDiagram.name);

                    // Calculate permission immediately for initial node mapping
                    // Note: userProfile might be null initially, handled by canEditDiagram defaulting to false
                    // We must rely on the effect dependency on userProfile to re-render if it changes
                    const canEdit = canEditDiagram(userProfile, loadedDiagram);

                    if (loadedDiagram.data) {
                        const loadedData = loadedDiagram.data as DiagramData;
                        // Map loaded nodes to ensure they work with default types
                        const mappedNodes = loadedData.nodes.map((n) => ({
                            ...n,
                            data: {
                                ...(n.data || { label: 'Node' }),
                                isReadOnly: !canEdit
                            },
                            // Keep existing type if it's default/input/output, otherwise fallback to default
                            type: ['input', 'output', 'default'].includes(n.type || '') ? n.type : 'default',
                        })) as AppNode[];

                        setNodes(mappedNodes);
                        setEdges((loadedData.edges as AppEdge[]) || []);

                        // Update snapshot to mark as clean
                        setLastSavedSnapshot(JSON.stringify({
                            nodes: mappedNodes,
                            edges: (loadedData.edges as AppEdge[]) || [],
                            name: loadedDiagram.name
                        }));
                    }
                } else {
                    alert('Diagram not found');
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Failed to load diagram', error);
                alert('Failed to load diagram');
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        loadDiagram();
    }, [id, getDiagram, navigate, setNodes, setEdges, userProfile]); // Added userProfile dependency to re-evaluate permissions

    // Re-apply read-only state to all nodes if permission changes (e.g., userProfile loads)
    useEffect(() => {
        setNodes((nds) => nds.map(node => ({
            ...node,
            data: { ...node.data, isReadOnly }
        })));
    }, [isReadOnly, setNodes]);

    const onConnect: OnConnect = useCallback(
        (params) => {
            if (isReadOnly) return;
            setEdges((eds) => addEdge(params, eds));
        },
        [setEdges, isReadOnly]
    );

    const addNode = () => {
        if (isReadOnly) return;
        const newNode: AppNode = {
            id: `${nodes.length + 1}_${Date.now()}`,
            position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
            data: {
                label: `Node ${nodes.length + 1}`,
                isReadOnly: isReadOnly
            },
            type: 'default',
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const deleteSelectedNodes = () => {
        if (isReadOnly) return;
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    };

    const handleSave = async () => {
        if (isReadOnly) return;

        if (!diagramName.trim()) {
            alert('Please enter a diagram name');
            return;
        }

        setIsSaving(true);
        try {
            const viewport = getViewport();
            const diagramData: DiagramData = {
                // Must sanitize nodes to remove isReadOnly before saving? 
                // Actually Firestore doesn't care, but it's cleaner to remove transient UI state.
                // But for now, saving it is harmless as it gets overwritten on load.
                nodes: nodes,
                edges: edges,
                viewport
            };

            if (id) {
                await updateDiagram(id, diagramName, diagramData);
                setSaveMessage('Diagram saved successfully!');
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                const newId = await createDiagram(diagramName, diagramData);
                navigate(`/editor/${newId}`, { replace: true, state: { saved: true } });
            }

            // Update snapshot to mark as clean
            setLastSavedSnapshot(JSON.stringify({ nodes: nodes, edges: edges, name: diagramName }));
        } catch (error) {
            console.error('Failed to save', error);
            alert('Failed to save diagram');
        } finally {
            setIsSaving(false);
        }
    };



    const handleBack = () => {
        navigate('/dashboard');
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    const isDirty = JSON.stringify({ nodes, edges, name: diagramName }) !== lastSavedSnapshot;

    return (
        <div className="editor-container">
            {saveMessage && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <span>{saveMessage}</span>
                </div>
            )}
            <header className="editor-header">
                <div className="header-left">
                    <button className="editor-btn icon-btn" onClick={handleBack} aria-label="Back">
                        <ArrowLeft size={20} />
                    </button>
                    {isReadOnly ? (
                        <h2 className="header-title">{diagramName} <span className="role-badge viewer" style={{ fontSize: '12px', verticalAlign: 'middle', marginLeft: '10px' }}>Read Only</span></h2>
                    ) : (
                        <input
                            type="text"
                            className="diagram-name-input"
                            value={diagramName}
                            onChange={(e) => setDiagramName(e.target.value)}
                            placeholder="Diagram name"
                        />
                    )}
                </div>

                <div className="header-center">
                    {!isReadOnly && (
                        <>
                            <button className="editor-btn" onClick={addNode}>
                                <Plus size={18} />
                                <span>Add Node</span>
                            </button>
                            <button className="editor-btn danger" onClick={deleteSelectedNodes}>
                                <Trash2 size={18} />
                                <span>Delete Node</span>
                            </button>
                        </>
                    )}
                </div>

                <div className="header-right">
                    <button className="editor-btn icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    {!isReadOnly && (
                        <>

                            <button
                                className="editor-btn primary"
                                onClick={handleSave}
                                disabled={isSaving || dbLoading || !isDirty}
                                title={!isDirty ? "No changes to save" : "Save diagram"}
                                style={{ opacity: !isDirty ? 0.5 : 1, cursor: !isDirty ? 'not-allowed' : 'pointer' }}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                <span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </>
                    )}
                </div>
            </header >

            {/* React Flow Canvas */}
            < div className="editor-canvas" >
                <ReactFlow<AppNode, AppEdge>
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    colorMode={theme === 'dark' ? 'dark' : 'light'}
                    nodesDraggable={!isReadOnly}
                    nodesConnectable={!isReadOnly}
                    elementsSelectable={true}
                >
                    <Controls />
                    <MiniMap
                        nodeColor={theme === 'dark' ? '#a855f7' : '#8b5cf6'}
                        maskColor={theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
                    />
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color={theme === 'dark' ? '#374151' : '#94a3b8'}
                    />
                </ReactFlow>
            </div >
        </div >
    );
};

const DiagramEditor = () => (
    <ReactFlowProvider>
        <DiagramEditorContent />
    </ReactFlowProvider>
);

export default DiagramEditor;
