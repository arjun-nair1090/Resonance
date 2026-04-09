"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, login as authLogin, signup as authSignup, logout as authLogout, updateUser as authUpdateUser } from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => { success: boolean; error?: string; user?: User };
    signup: (name: string, email: string, password: string) => { success: boolean; error?: string; user?: User };
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const login = (email: string, password: string) => {
        const result = authLogin(email, password);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const signup = (name: string, email: string, password: string) => {
        const result = authSignup(name, email, password);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const logout = () => {
        authLogout();
        setUser(null);
    };

    const updateUserState = (updatedUser: User) => {
        authUpdateUser(updatedUser);
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser: updateUserState }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
