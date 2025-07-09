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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setIsGuest(!session?.user);
      if (session?.user) {
        // Check if user has any workouts
        const { data: workouts, error } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
        if (!error && workouts && workouts.length === 0) {
          await createStarterWorkoutsForUser(session.user.id);
        }
      }
    });
    // Initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsGuest(!session?.user);
      setLoading(false);
      if (session?.user) {
        // Check if user has any workouts
        const { data: workouts, error } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
        if (!error && workouts && workouts.length === 0) {
          await createStarterWorkoutsForUser(session.user.id);
        }
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    return { error };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
} 