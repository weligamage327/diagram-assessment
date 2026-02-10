import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutGrid, Sun, Moon } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { signIn } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
                navigate('/dashboard');
            } else {
                // TODO: need to implement sign up later
                setError('Sign up is not available yet');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            if (errorMessage.includes('auth/invalid-credential')) {
                setError('Invalid email or password');
            } else if (errorMessage.includes('auth/user-not-found')) {
                setError('No account found with this email');
            } else if (errorMessage.includes('auth/wrong-password')) {
                setError('Incorrect password');
            } else {
                setError('Authentication failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Theme Toggle Button */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="login-content">
                <div className="login-header">
                    <div className="login-logo">
                        <LayoutGrid size={32} />
                    </div>
                    <h1 className="login-title">Diagram Builder</h1>
                    <p className="login-subtitle">Create and collaborate on visual diagrams</p>
                </div>

                <div className="login-card">
                    <div className="login-toggle">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`login-toggle-btn ${isLogin ? 'active' : ''}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`login-toggle-btn ${!isLogin ? 'active' : ''}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        <button type="submit" className="login-submit" disabled={loading}>
                            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {isLogin && (
                        <p className="login-footer">
                            Forgot your password? <button type="button">Reset it here</button>
                        </p>
                    )}
                </div>

                <p className="login-copyright">© 2026 Diagram Builder. All rights reserved.</p>
            </div>
        </div>
    );
};

export default Login;
