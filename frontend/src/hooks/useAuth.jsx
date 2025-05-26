// src/hooks/useAuth.jsx
import { useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = () => {
            const currentUser = AuthService.getCurrentUser();
            if (currentUser && currentUser.accessToken) {
                setIsAuthenticated(true);
                setUser(currentUser);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await AuthService.login(email, password);
            setIsAuthenticated(true);
            setUser(AuthService.getCurrentUser());
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout
    };
};
