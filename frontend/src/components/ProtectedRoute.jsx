
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        console.log('ProtectedRoute at', location.pathname);
        console.log('Auth state:', { loading, isAuthenticated: !!currentUser });
        if (currentUser) {
            console.log('User is authenticated:', currentUser.email);
        }
    }, [currentUser, loading, location]);

    if (loading) {
        console.log('Still loading auth state...');
        return <LoadingSpinner />;
    } if (!currentUser) {
        console.log('User not authenticated, redirecting to login from:', location.pathname);
        
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    console.log('User authenticated, rendering protected content');
    return children;
};

export default ProtectedRoute;
