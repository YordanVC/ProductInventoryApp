import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authApi } from '../api/auth';

interface AuthContextType {
    isAuthenticated: boolean;
    userId: number;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(authApi.isAuthenticated());
    const [userId, setUserId] = useState(authApi.getUserId());

    useEffect(() => {
        setIsAuthenticated(authApi.isAuthenticated());
        setUserId(authApi.getUserId());
    }, []);

    const login = async (username: string, password: string) => {
        await authApi.login({ username, password });
        setIsAuthenticated(true);
        setUserId(authApi.getUserId());
    };

    const logout = () => {
        authApi.logout();
        setIsAuthenticated(false);
        setUserId(0);
    };

    const value = useMemo(
        () => ({ isAuthenticated, userId, login, logout }),
        [isAuthenticated, userId]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};