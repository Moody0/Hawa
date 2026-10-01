'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AdminUserSession } from './admin-auth';
import { laravelClientFetch } from './laravel-client';

type Session = {user: AdminUserSession};
type SessionState = {data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated'};
const Context = createContext<SessionState>({data: null, status: 'loading'});

export function SessionProvider({session, children}: {session?: Session | null; children: React.ReactNode}) {
    const [state, setState] = useState<SessionState>({data: session || null, status: session ? 'authenticated' : 'loading'});
    useEffect(() => {
        let active = true;
        let controller: AbortController | null = null;
        const refresh = async () => {
            controller?.abort();
            const request = new AbortController();
            controller = request;
            try {
                const response = await laravelClientFetch('/api/admin/auth/me', {cache: 'no-store', signal: request.signal});
                const body = await response.json();
                if (!active || request.signal.aborted || controller !== request || response.status >= 500) return;
                const data = response.ok && body.user ? {user: body.user} : null;
                setState({data, status: data ? 'authenticated' : 'unauthenticated'});
            } catch { /* Preserve the verified session during a connection failure. */ }
        };
        const focus = () => { if (document.visibilityState === 'visible') void refresh(); };
        window.addEventListener('focus', focus);
        document.addEventListener('visibilitychange', focus);
        void refresh();
        return () => { active = false; controller?.abort(); window.removeEventListener('focus', focus); document.removeEventListener('visibilitychange', focus); };
    }, []);
    return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useSession() { return useContext(Context); }
export async function signOut({callbackUrl = '/admin/login'}: {callbackUrl?: string} = {}) {
    const response = await laravelClientFetch('/api/admin/auth/logout', {method: 'POST'});
    if (!response.ok) throw new Error('Could not sign out. Please try again.');
    window.location.replace(callbackUrl.startsWith('/admin/') ? callbackUrl : '/admin/login');
}
