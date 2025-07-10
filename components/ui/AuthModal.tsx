"use client"
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { login, signup, loading, isGuest, user, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // If already logged in, show special message
  if (!isGuest && user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-900 border-cyan-700/40 text-white max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col items-center justify-center gap-6">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-2xl font-bold mb-2 text-center">
              You are already logged in.
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 w-full">
            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[44px]"
              onClick={async () => {
                await logout();
                onOpenChange(false);
              }}
              variant="outline"
            >
              Log out
            </Button>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[44px]"
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => {
                  router.replace('/workouts');
                }, 150); // Wait for modal to close
              }}
              variant="default"
            >
              Return to my account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (mode === 'login') {
      const { error } = await login(email, password) as any;
      if (error) setError(error.message || 'Login failed');
      else {
        // After login, redirect to /workouts if on root, else stay
        if (typeof window !== 'undefined') {
          if (window.location.pathname === '/') {
            router.replace('/workouts');
          }
        }
        onOpenChange(false);
      }
    } else {
      const { error } = await signup(email, password) as any;
      if (error) setError(error.message || 'Signup failed');
      else setSuccess('Check your email to confirm your account!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-cyan-700/40 text-white max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 text-2xl font-bold mb-2">
            {mode === 'login' ? 'Login to FitFlow' : 'Sign Up for FitFlow'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-gray-800 border-cyan-700/30 text-white focus:ring-2 focus:ring-cyan-400"
            autoFocus
            aria-label="Email address"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-gray-800 border-cyan-700/30 text-white focus:ring-2 focus:ring-cyan-400"
            aria-label="Password"
            autoComplete="current-password"
          />
          {error && <div className="text-red-400 text-sm" role="alert">{error}</div>}
          {success && <div className="text-green-400 text-sm" role="status">{success}</div>}
          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[44px]" disabled={loading} aria-label={mode === 'login' ? 'Login' : 'Sign Up'}>
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-cyan-400 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded min-h-[44px] px-2"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
              setSuccess(null);
            }}
            aria-label={mode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'}
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 