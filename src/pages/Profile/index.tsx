import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, LogOut, ArrowLeft, Moon, Sun, Shield } from 'lucide-react';
import { ProfileActionButton } from './ProfileActionButton';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, userProfile, logout, loading } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleRole = async () => {
        if (!user || !userProfile) return;

        setIsUpdating(true);
        try {
            const newRole = userProfile.role === 'viewer' ? 'editor' : 'viewer';
            const userRef = doc(db, 'users', user.uid);

            await updateDoc(userRef, {
                role: newRole
            });

            setIsUpdating(false);
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update role');
            setIsUpdating(false);
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
                        <div className="role-badge-container">
                            <span className={`role-badge ${userProfile?.role || 'viewer'}`}>
                                {loading ? 'LOADING...' : (userProfile?.role ? userProfile.role.toUpperCase() : 'ERROR / NOT FOUND')}
                            </span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <ProfileActionButton
                            variant="secondary"
                            onClick={toggleRole}
                            disabled={isUpdating}
                            isLoading={isUpdating}
                            icon={<Shield size={18} />}
                        >
                            Switch to {userProfile?.role === 'viewer' ? 'Editor' : 'Viewer'} Mode
                        </ProfileActionButton>

                        <ProfileActionButton
                            variant="danger"
                            onClick={handleLogout}
                            icon={<LogOut size={18} />}
                        >
                            Sign Out
                        </ProfileActionButton>
                    </div>
                </div>
            </div>

            <div className="profile-section">
                {/* Role Info */}
                <div className="role-info-card">
                    <h3>Role Permissions</h3>
                    <div className="role-list">
                        <div className={`role-item ${userProfile?.role === 'viewer' ? 'active' : ''}`}>
                            <span className="role-badge viewer">viewer</span>
                            <p>Can view diagrams only</p>
                        </div>
                        <div className={`role-item ${userProfile?.role === 'editor' ? 'active' : ''}`}>
                            <span className="role-badge editor">editor</span>
                            <p>Can view and edit diagrams</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
