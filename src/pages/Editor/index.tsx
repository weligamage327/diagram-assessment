import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Node,
    type Edge,
    type OnConnect,
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from '../../hooks/useTheme';
import { useDiagrams } from '../../hooks/useDiagrams';
import { useAuth } from '../../hooks/useAuth';
import type { DiagramData } from '../../types/types';
import { ArrowLeft, Save, Sun, Moon, Plus, Trash2, Loader2 } from 'lucide-react';
import './DiagramEditor.css';

// Initial nodes for a new diagram
const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 250, y: 100 },
        data: { label: 'Start' },
        type: 'input',
    },
    {
        id: '2',
        position: { x: 250, y: 250 },
        data: { label: 'Process' },
    },
    {
        id: '3',
        position: { x: 250, y: 400 },
        data: { label: 'End' },
        type: 'output',
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3' },
];

const DiagramEditorContent = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { theme, toggleTheme } = useTheme();
    const { createDiagram, updateDiagram, getDiagram, loading: dbLoading } = useDiagrams();
    const { userProfile } = useAuth();
    const { getViewport } = useReactFlow();

    const isViewer = userProfile?.role === 'viewer';

    const [diagramName, setDiagramName] = useState(id ? 'Untitled Diagram' : 'New Diagram');
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load diagram
    useEffect(() => {
        if (!id) return;

        const loadDiagram = async () => {
            setIsLoading(true);
            try {
                const diagram = await getDiagram(id);
                if (diagram) {
                    setDiagramName(diagram.name);
                    if (diagram.data) {
                        const loadedData = diagram.data as DiagramData;
                        const mappedNodes = loadedData.nodes.map(n => ({
                            ...n,
                            data: n.data || { label: 'Node' }
                        })) as Node[];

                        setNodes(mappedNodes);
                        setEdges((loadedData.edges as Edge[]) || []);
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
    }, [id, getDiagram, navigate, setNodes, setEdges]);

    const onConnect: OnConnect = useCallback(
        (params) => {
            if (isViewer) return;
            setEdges((eds) => addEdge(params, eds));
        },
        [setEdges, isViewer]
    );

    const addNode = () => {
        if (isViewer) return;
        const newNode: Node = {
            id: `${nodes.length + 1}_${Date.now()}`,
            position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
            data: { label: `Node ${nodes.length + 1}` },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const deleteSelectedNodes = () => {
        if (isViewer) return;
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    };

    const handleSave = async () => {
        if (isViewer) return;

        if (!diagramName.trim()) {
            alert('Please enter a diagram name');
            return;
        }

        setIsSaving(true);
        try {
            const viewport = getViewport();
            const diagramData: DiagramData = {
                nodes: nodes as any,
                edges: edges as any,
                viewport
            };

            if (id) {
                await updateDiagram(id, diagramName, diagramData);
            } else {
                const newId = await createDiagram(diagramName, diagramData);
                navigate(`/editor/${newId}`, { replace: true });
            }
            alert('Diagram saved successfully!');
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

    // Node label editing logic
    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        if (isViewer) return;
        const newLabel = prompt('Enter new label:', node.data.label as string);
        if (newLabel !== null) {
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node.id) {
                        return { ...n, data: { ...n.data, label: newLabel } };
                    }
                    return n;
                })
            );
        }
    }, [setNodes, isViewer]);

    if (isLoading) {
        return (
            <div className="loading-screen">
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    return (
        <div className="editor-container">
            <header className="editor-header">
                <div className="header-left">
                    <button className="editor-btn icon-btn" onClick={handleBack} aria-label="Back">
                        <ArrowLeft size={20} />
                    </button>
                    {isViewer ? (
                        <h2 className="header-title">{diagramName} <span className="role-badge viewer" style={{ fontSize: '12px', verticalAlign: 'middle', marginLeft: '10px' }}>View Only</span></h2>
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
                    {!isViewer && (
                        <>
                            <button className="editor-btn" onClick={addNode}>
                                <Plus size={18} />
                                <span>Add Node</span>
                            </button>
                            <button className="editor-btn danger" onClick={deleteSelectedNodes}>
                                <Trash2 size={18} />
                                <span>Delete</span>
                            </button>
                        </>
                    )}
                </div>

                <div className="header-right">
                    <button className="editor-btn icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    {!isViewer && (
                        <button
                            className="editor-btn primary"
                            onClick={handleSave}
                            disabled={isSaving || dbLoading}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                    )}
                </div>
            </header>

            {/* React Flow Canvas */}
            <div className="editor-canvas">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    fitView
                    colorMode={theme === 'dark' ? 'dark' : 'light'}
                    nodesDraggable={!isViewer}
                    nodesConnectable={!isViewer}
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
            </div>
        </div>
    );
};

const DiagramEditor = () => (
    <ReactFlowProvider>
        <DiagramEditorContent />
    </ReactFlowProvider>
);

export default DiagramEditor;
