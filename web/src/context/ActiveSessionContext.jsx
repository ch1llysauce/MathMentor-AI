import { createContext, useContext, useState, useCallback } from 'react';

const ActiveSessionContext = createContext(null);

export function ActiveSessionProvider({ children }) {
  const [activeSession, setActiveSessionState] = useState(null);

  const setActiveSession = useCallback((session) => {
    setActiveSessionState(session);
  }, []);

  const clearActiveSession = useCallback(() => {
    setActiveSessionState(null);
  }, []);

  return (
    <ActiveSessionContext.Provider value={{ activeSession, setActiveSession, clearActiveSession }}>
      {children}
    </ActiveSessionContext.Provider>
  );
}

export function useActiveSession() {
  const context = useContext(ActiveSessionContext);
  if (!context) {
    return { activeSession: null, setActiveSession: () => {}, clearActiveSession: () => {} };
  }
  return context;
}
