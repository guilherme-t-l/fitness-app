"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { createStarterWorkoutsForUser } from '@/lib/database';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any } | void>;
  signup: (email: string, password: string) => Promise<{ error: any } | void>;
  logout: () => Promise<void>;
  isGuest: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to initialize session and create starter workouts if needed
  const initializeSession = async (session: any) => {
    try {
      // Drop anonymous sessions so guests always share the default guest account
      if (session?.user?.is_anonymous) {
        await supabase.auth.signOut();
        session = null;
      }

      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setIsGuest(!nextUser);

      if (nextUser) {
        try {
          const { data: workouts, error: workoutsError } = await supabase
            .from('workouts')
            .select('id')
            .eq('user_id', nextUser.id)
            .limit(1);
          if (workoutsError) throw workoutsError;
          if (workouts && workouts.length === 0) {
            await createStarterWorkoutsForUser(nextUser.id);
          }
        } catch (starterErr: any) {
          // Soft-fail: keep the app usable if starter seeding fails
          console.error('Starter workout setup failed:', starterErr);
          setError(starterErr?.message || 'Could not create starter workouts.');
        }
      }
    } catch (err: any) {
      console.error('Failed to initialize user session:', err);
      setError(err?.message || 'Failed to initialize user session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribed = false;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!unsubscribed) {
        void initializeSession(session);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!unsubscribed) {
        void initializeSession(session);
      }
    });

    return () => {
      unsubscribed = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message || 'Login failed');
    return { error };
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message || 'Signup failed');
    return { error };
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err?.message || 'Logout failed');
    } finally {
      setLoading(false);
      window.location.reload(); // Always force UI update
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isGuest, error }}>
      {error ? (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] rounded-md border border-border bg-card px-4 py-3 text-sm shadow-sm">
          <div className="font-medium text-foreground mb-1">Something went wrong</div>
          <div className="text-muted-foreground mb-2">{error}</div>
          <button
            className="text-primary underline text-xs"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
