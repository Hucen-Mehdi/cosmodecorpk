"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, AuthUser } from '../api/auth';
import { API_BASE_URL } from '../api/config';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                if (!storedToken) {
                    setUser(null);
                    setToken(null);
                    setLoading(false);
                    return;
                }

                setToken(storedToken);

                // Graceful session restore without throwing exceptions on 401
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        // 📱 Identify mobile requests if needed
                        'X-Client-Type': 'mobile',
                    },
                });

                if (res.status === 401) {
                    console.warn("Session restore: Token invalid or expired. Clearing session.");
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    console.error("Session restore failed with status:", res.status);
                    setToken(null);
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setUser(data.user);
            } catch (err) {
                console.error("Session restore failed (network/unhandled):", err);
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await apiLogin(email, password);
        if (data && data.token) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            return { success: true };
        } else {
            console.warn('Login failed:', (data as any).message);
            setUser(null);
            setToken(null);
            return { success: false, message: (data as any).message || 'Login failed' };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        const data = await apiRegister(name, email, password);
        if (data && data.token) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            return { success: true };
        } else {
            console.warn('Registration failed:', (data as any).message);
            setUser(null);
            setToken(null);
            return { success: false, message: (data as any).message || 'Registration failed' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
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
