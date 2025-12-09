
import React, { createContext, useContext, useState, useEffect } from 'react';
import AdminService from '../services/admin.service';

const AdminContext = createContext(null);


const parseStoredAdmin = () => {
    try {
        const storedAdmin = localStorage.getItem('admin');
        if (!storedAdmin) return null;

        const admin = JSON.parse(storedAdmin);
        return admin && admin.accessToken ? admin : null;
    } catch (error) {
        console.error('Error parsing stored admin:', error);
        return null;
    }
};

export const AdminProvider = ({ children }) => {
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = () => {
            try {
                const admin = parseStoredAdmin();
                console.log('Initial admin check:', admin ? 'Authenticated as admin' : 'Not authenticated as admin');
                setCurrentAdmin(admin);
            } catch (error) {
                console.error('Error checking admin:', error);
                setCurrentAdmin(null);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await AdminService.login(username, password);
            const admin = parseStoredAdmin();
            console.log('Admin login successful, admin:', admin);
            setCurrentAdmin(admin);
            return admin;
        } catch (error) {
            console.error('Admin login error in context:', error);
            throw error;
        }
    };

    const logout = () => {
        console.log('Admin logging out...');
        AdminService.logout();
        setCurrentAdmin(null);
    };

    const value = {
        currentAdmin,
        login,
        logout,
        loading
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    return useContext(AdminContext);
};
