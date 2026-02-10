import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Sun, Moon, Plus, LogOut, User, LayoutGrid } from 'lucide-react';
import './Dashboard.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    // Diagrams state removed

    const handleCreateDiagram = () => {
        alert('Create Diagram ');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
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
                        <button className="create-btn" onClick={handleCreateDiagram}>
                            <Plus size={20} />
                            <span>New Diagram</span>
                        </button>
                    </div>

                    {/* Diagrams Grid Placeholder */}
                    <div className="empty-state">
                        <div className="empty-icon">
                            <LayoutGrid size={48} />
                        </div>
                        <h3 className="empty-title">Welcome to Diagram Builder</h3>
                        <p className="empty-subtitle">
                            Ready to create your first diagram?
                        </p>
                        <button className="create-btn" onClick={handleCreateDiagram}>
                            <Plus size={20} />
                            <span>Create New Diagram</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
