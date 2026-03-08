'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, MiniApp } from '@/types';
import type { PersistenceLayer } from '@/lib/db/client';
import { getPersistence } from '@/lib/db/client';

interface AppContextValue {
  user: User | null;
  miniApps: MiniApp[];
  db: PersistenceLayer | null;
  ready: boolean;
  setUser: (u: User | null) => void;
  addMiniApp: (app: MiniApp) => void;
  removeMiniApp: (id: string) => void;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [miniApps, setMiniApps] = useState<MiniApp[]>([]);
  const [db, setDb] = useState<PersistenceLayer | null>(null);

  const refresh = async () => {
    if (!db) return;
    const u = await db.getUser();
    const apps = await db.getMiniApps();
    setUserState(u);
    setMiniApps(apps);
  };

  useEffect(() => {
    getPersistence().then(setDb);
  }, []);

  useEffect(() => {
    if (db) refresh();
  }, [db]);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u && db) db.saveUser(u);
  };

  const addMiniApp = async (app: MiniApp) => {
    if (!db) return;
    await db.saveMiniApp(app);
    setMiniApps((prev) => {
      const idx = prev.findIndex((a) => a.id === app.id);
      const next = [...prev];
      if (idx >= 0) next[idx] = app;
      else next.push(app);
      return next;
    });
  };

  const removeMiniApp = async (id: string) => {
    if (!db) return;
    await db.deleteMiniApp(id);
    setMiniApps((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        miniApps,
        db,
        ready: db !== null,
        setUser,
        addMiniApp,
        removeMiniApp,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
