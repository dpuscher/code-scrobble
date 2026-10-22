import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from './types';

// Every logged-in page receives the session from getServerSideProps (see
// src/server/guard.ts), so it never has to be fetched on the client.
const SessionContext = createContext<Session | null>(null);

export const SessionProvider = ({ session, children }: { session: Session | null; children: ReactNode }) => (
  <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
);

export const useSession = () => useContext(SessionContext);
