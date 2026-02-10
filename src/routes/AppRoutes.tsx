import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* All other pages - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRoutes;
