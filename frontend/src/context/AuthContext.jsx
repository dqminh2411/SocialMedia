
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext(null);


const parseStoredUser = () => {
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return null;
        
        const user = JSON.parse(storedUser);
        return user && user.accessToken ? user : null;
    } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const checkUser = () => {
            try {
                const user = parseStoredUser();
                console.log('Initial auth check:', user ? 'Authenticated' : 'Not authenticated');
                setCurrentUser(user);
            } catch (error) {
                console.error('Error checking user:', error);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };
        
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const user = await AuthService.login(email, password);
            setCurrentUser(user);
            console.log('Storing user data:', user);
            localStorage.setItem('user', JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Login error in context:', error);
            return false;
        }

    };

    const logout = () => {
        console.log('Logging out...');
        AuthService.logout();
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
