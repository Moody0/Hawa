'use client';
import { createContext, useContext } from 'react';
import { getSiteContacts } from '@/lib/website-content';

type Contacts = ReturnType<typeof getSiteContacts>;
const Context = createContext<Contacts>(getSiteContacts());
export function SiteContactsProvider({ contacts, children }: { contacts: Contacts; children: React.ReactNode }) {
    return <Context.Provider value={contacts}>{children}</Context.Provider>;
}
export function useSiteContacts() { return useContext(Context); }
