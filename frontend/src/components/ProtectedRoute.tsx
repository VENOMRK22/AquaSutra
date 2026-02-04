import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { user } = useAuth();

    // Note: Loading state is handled inside AuthContext provider wrapper,
    // so we can assume if this renders, loading is false.

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
