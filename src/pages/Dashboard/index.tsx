import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useDiagrams } from '../../hooks/useDiagrams';
import type { Diagram } from '../../types';
import { Sun, Moon, Plus, LogOut, User, LayoutGrid, Loader2 } from 'lucide-react';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ShareDiagramModal } from './components/ShareDiagramModal';
import { DiagramCard } from './components/DiagramCard';
import './Dashboard.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, userProfile, logout } = useAuth();
    const { getUserDiagrams, deleteDiagram, shareDiagram } = useDiagrams();

    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
    const [shareModal, setShareModal] = useState<{ id: string; name: string } | null>(null);
    const [shareSuccess, setShareSuccess] = useState<string | null>(null);

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

    const handleShareSubmit = async (email: string, role: 'view' | 'edit') => {
        if (!shareModal) return;

        try {
            await shareDiagram(shareModal.id, email, role);
            setShareSuccess(`Shared "${shareModal.name}" successfully!`);
            setTimeout(() => setShareSuccess(null), 3000);
        } catch (error) {
            console.error('Failed to share diagram:', error);
            alert('Failed to share diagram');
            throw error;
        }
    };

    return (
        <div className="dashboard-container">
            {shareSuccess && (
                <div className="dashboard-toast">
                    <span>{shareSuccess}</span>
                </div>
            )}
            {/* ... Header ... */}
            <header className="dashboard-header">
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
                                <span style={{ marginLeft: '8px' }}>New Diagram</span>
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
                                    <span style={{ marginLeft: '8px' }}>Create Diagram</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="diagrams-grid">
                            {diagrams.map((diagram) => (
                                <DiagramCard
                                    key={diagram.id}
                                    diagram={diagram}
                                    currentUserId={user?.uid}
                                    currentUserEmail={user?.email}
                                    onOpen={handleOpenDiagram}
                                    onDelete={(id, name) => setDeleteModal({ id, name })}
                                    onShare={(id, name) => setShareModal({ id, name })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                onConfirm={confirmDelete}
                itemName={deleteModal?.name || ''}
            />

            {/* Share Modal */}
            <ShareDiagramModal
                isOpen={!!shareModal}
                onClose={() => setShareModal(null)}
                diagramName={shareModal?.name || ''}
                onShare={handleShareSubmit}
            />
        </div>
    );
};

export default DashboardPage;
