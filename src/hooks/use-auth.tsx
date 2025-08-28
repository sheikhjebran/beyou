'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailPassword, signOutUser } from '@/services/authService';

interface User {
    id: string;
    email: string;
    role: string;
    displayName?: string;
    photoURL?: string;
}

interface AuthState {
    currentUser: User | null;
    loading: boolean;
    error: string | null;
}

const AuthStateContext = createContext<AuthState>({
    currentUser: null,
    loading: true,
    error: null
});

const AuthDispatchContext = createContext<{
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}>({
    login: async () => {},
    logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        currentUser: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setState(prev => ({ ...prev, currentUser: data.user, loading: false }));
                } else {
                    setState(prev => ({ ...prev, currentUser: null, loading: false }));
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setState(prev => ({ ...prev, currentUser: null, loading: false }));
            }
        };
        
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await signInWithEmailPassword(email, password);
            const user: User = {
                id: response.user.id,
                email: response.user.email,
                role: response.user.role
            };
            setState(prev => ({ ...prev, currentUser: user }));
            // User session is now handled by HTTP-only cookie
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred during login';
            setState(prev => ({ ...prev, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const logout = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            await signOutUser();
            setState(prev => ({ ...prev, currentUser: null }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred during logout';
            setState(prev => ({ ...prev, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <AuthStateContext.Provider value={state}>
            <AuthDispatchContext.Provider value={{ login, logout }}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
    );
}

export function useAuthState() {
    const context = useContext(AuthStateContext);
    if (context === undefined) {
        throw new Error('useAuthState must be used within an AuthProvider');
    }
    return context;
}

export function useAuthDispatch() {
    const context = useContext(AuthDispatchContext);
    if (context === undefined) {
        throw new Error('useAuthDispatch must be used within an AuthProvider');
    }
    return context;
}
