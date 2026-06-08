import { createContext, useContext, useEffect, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { pb } from '../services/pb';

interface PocketBaseContextValue {
  pb: typeof pb;
  isValid: boolean;
  record: RecordModel | null;
}

const PocketBaseContext = createContext<PocketBaseContextValue>({
  pb,
  isValid: pb.authStore.isValid,
  record: pb.authStore.record,
});

export function PocketBaseProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    isValid: pb.authStore.isValid,
    record: pb.authStore.record,
  });

  useEffect(() => {
    // Suscribirse a cambios en el auth store para re-renderizar consumidores
    const unsubscribe = pb.authStore.onChange(() => {
      setAuthState({
        isValid: pb.authStore.isValid,
        record: pb.authStore.record,
      });
    });

    return unsubscribe;
  }, []);

  return (
    <PocketBaseContext.Provider value={{ pb, isValid: authState.isValid, record: authState.record }}>
      {children}
    </PocketBaseContext.Provider>
  );
}

export const usePocketBase = () => useContext(PocketBaseContext);
