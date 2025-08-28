
'use client'

import React, { type ReactNode } from 'react';
import { AuthProvider as AuthStateProvider, useAuthState, useAuthDispatch } from '@/hooks/use-auth';

export function useAuth() {
    const state = useAuthState();
    const dispatch = useAuthDispatch();
    return { ...state, ...dispatch };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return <AuthStateProvider>{children}</AuthStateProvider>;
}

export { useAuthState, useAuthDispatch };
