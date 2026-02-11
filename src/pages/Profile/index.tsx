import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { User, LogOut, ArrowLeft, Moon, Sun } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, userProfile, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="profile-container">
            {/* Header */}
            <header className="profile-header-nav">
                <button className="icon-btn" onClick={() => navigate('/dashboard')} aria-label="Back to Dashboard">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="header-title">Profile</h1>
                <button
                    className="icon-btn"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </header>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar">
                        <User size={48} />
                    </div>

                    <div className="profile-info">
                        <h2 className="profile-email">{user?.email}</h2>
                        <p className="profile-role">
                            {userProfile?.role ? userProfile.role.toUpperCase() : 'Loading...'}
                        </p>
                    </div>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Diagrams</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">Active</span>
                            <span className="stat-label">Status</span>
                        </div>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            <div className="profile-section">
                {/* Role Info */}
                <div className="role-info-card">
                    <h3>Role Permissions</h3>
                    <div className="role-list">
                        <div className="role-item">
                            <span className="role-badge viewer">viewer</span>
                            <p>Can view diagrams only</p>
                        </div>
                        <div className="role-item">
                            <span className="role-badge editor">editor</span>
                            <p>Can view and edit diagrams</p>
                        </div>
                        <div className="role-item">
                            <span className="role-badge admin">admin</span>
                            <p>Full access - can manage users and diagrams</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
