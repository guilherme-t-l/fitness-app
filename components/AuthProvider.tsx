"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_USER_ID } from '@/lib/utils';
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
      setUser(session?.user ?? null);
      setIsGuest(!session?.user);
      if (session?.user) {
        // Check if user has any workouts
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
        if (workoutsError) throw workoutsError;
        if (workouts && workouts.length === 0) {
          await createStarterWorkoutsForUser(session.user.id);
        }
      }
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize user session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribed = false;
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!unsubscribed) {
        initializeSession(session);
      }
    });
    // Initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!unsubscribed) {
        initializeSession(session);
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-400 bg-black">
        <div className="text-2xl font-bold mb-2">Authentication Error</div>
        <div className="mb-4">{error}</div>
        <button
          className="px-4 py-2 bg-cyan-700 text-white rounded hover:bg-cyan-600"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isGuest, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
} 