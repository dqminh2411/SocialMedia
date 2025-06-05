
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import LoadingSpinner from './LoadingSpinner';

const AdminProtectedRoute = ({ children }) => {
    const { currentAdmin, loading } = useAdmin();
    const location = useLocation();

    useEffect(() => {
        console.log('AdminProtectedRoute at', location.pathname);
        console.log('Admin auth state:', { loading, isAuthenticated: !!currentAdmin });
        if (currentAdmin) {
            console.log('Admin is authenticated:', currentAdmin.username);
        }
    }, [currentAdmin, loading, location]);

    if (loading) {
        console.log('Still loading admin auth state...');
        return <LoadingSpinner />;
    }

    if (!currentAdmin) {
        console.log('Admin not authenticated, redirecting to admin login from:', location.pathname);
        
        return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }

    console.log('Admin authenticated, rendering protected content');
    return children;
};

export default AdminProtectedRoute;
