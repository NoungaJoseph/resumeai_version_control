import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    plan: 'free' | 'pro';
    profileImage?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    register: (data: any) => Promise<void>;
    isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Mock login for demonstration
    const login = async (credentials: any) => {
        // In a real app, this would be an API call
        setUser({
            id: '1',
            name: 'Nounga Joseph',
            email: 'nounga@example.com',
            plan: 'free',
            profileImage: undefined
        });
    };

    const logout = () => {
        setUser(null);
    };

    const register = async (data: any) => {
        // Mock registration
        setUser({
            id: '2',
            name: data.name || 'New User',
            email: data.email,
            plan: 'free'
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            logout,
            register,
            isGuest: !user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
