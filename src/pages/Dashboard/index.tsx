import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useDiagrams } from '../../hooks/useDiagrams';
import type { Diagram } from '../../types';
import { Sun, Moon, Plus, LogOut, User, LayoutGrid, Loader2, Trash2, X } from 'lucide-react';
import './Dashboard.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, userProfile, logout } = useAuth();
    const { getUserDiagrams, deleteDiagram } = useDiagrams();

    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

    const isViewer = userProfile?.role === 'viewer';

    useEffect(() => {
        const fetchDiagrams = async () => {
            try {
                const data = await getUserDiagrams();
                setDiagrams(data);
            } catch (error) {
                console.error('Failed to fetch diagrams', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDiagrams();
        }
    }, [user, getUserDiagrams]);

    const handleCreateDiagram = () => {
        if (isViewer) return;
        navigate('/editor');
    };

    const handleOpenDiagram = (id: string) => {
        navigate(`/editor/${id}`);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal) return;

        try {
            await deleteDiagram(deleteModal.id);
            setDiagrams(prev => prev.filter(d => d.id !== deleteModal.id));
            setDeleteModal(null);
        } catch (error) {
            console.error('Failed to delete diagram:', error);
            alert('Failed to delete diagram');
        }
    };

    return (
        <div className="dashboard-container">
            {/* ... Header ... */}
            <header className="dashboard-header">
                {/* ... same header content ... */}
                <div className="header-left">
                    <div className="header-logo">
                        <LayoutGrid size={24} />
                    </div>
                    <h1 className="header-title">Diagram Builder</h1>
                </div>

                <div className="header-right">
                    {user && (
                        <span className="user-email">{user.email}</span>
                    )}
                    <button
                        className="header-btn"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button className="header-btn" onClick={() => navigate('/profile')} aria-label="Profile">
                        <User size={20} />
                    </button>
                    <button
                        className="header-btn logout-btn"
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-content">
                    {/* Page Title & Actions */}
                    <div className="content-header">
                        <div>
                            <h2 className="content-title">My Diagrams</h2>
                            <p className="content-subtitle">Create and manage your visual diagrams</p>
                        </div>
                        {!isViewer && (
                            <button className="create-btn" onClick={handleCreateDiagram}>
                                <Plus size={20} />
                                <span>New Diagram</span>
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <Loader2 className="animate-spin" size={48} />
                            <p className="empty-subtitle">Loading diagrams...</p>
                        </div>
                    ) : diagrams.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <LayoutGrid size={48} />
                            </div>
                            <h3 className="empty-title">No diagrams yet</h3>
                            <p className="empty-subtitle">
                                {isViewer ? "You haven't been assigned any diagrams yet." : "Create your first diagram to get started"}
                            </p>
                            {!isViewer && (
                                <button className="create-btn" onClick={handleCreateDiagram}>
                                    <Plus size={20} />
                                    <span>Create Diagram</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="diagrams-grid">
                            {diagrams.map((diagram) => (
                                <div
                                    key={diagram.id}
                                    className="diagram-card"
                                    onClick={() => handleOpenDiagram(diagram.id)}
                                >
                                    <div className="diagram-preview">
                                        <LayoutGrid size={32} />
                                    </div>
                                    <div className="diagram-info">
                                        <div className="diagram-header-row">
                                            <h4 className="diagram-name">{diagram.name}</h4>
                                            {!isViewer && (
                                                <button
                                                    className="delete-btn-inline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteModal({ id: diagram.id, name: diagram.name });
                                                    }}
                                                    aria-label="Delete diagram"
                                                    title="Delete diagram"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="diagram-meta">
                                            {diagram.nodeCount} nodes • Updated {diagram.updatedAt?.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Delete Diagram</h3>
                            <button className="modal-close" onClick={() => setDeleteModal(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <span className="highlight-text">"{deleteModal.name}"</span>?</p>
                            <p className="modal-warning">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setDeleteModal(null)}>
                                Cancel
                            </button>
                            <button className="modal-btn danger" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
